/** Creates a salted password hash without exposing the password in the source or shell history. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { once } from 'node:events';

async function obtainPasswords(){
  if(!process.stdin.isTTY){
    // Noninteractive CI/test case. Run on a private pipe only; never put a real password in shell history.
    let input='';for await (const chunk of process.stdin)input+=chunk.toString('utf8');
    return input.replace(/\r/g,'').split('\n').slice(0,2);
  }
  const rl=readline.createInterface({input:process.stdin,output:process.stdout,terminal:true});
  let masking=false;
  const original=rl._writeToOutput;
  rl._writeToOutput=function(str){if(masking && !/[\r\n]/.test(str))original.call(rl,'*'.repeat([...str].length));else original.call(rl,str)};
  function ask(prompt){return new Promise(resolve=>{
    // Keep the prompt visible. Mask only the password characters typed after it.
    masking=false;
    rl.question(prompt,value=>{masking=false;console.log();resolve(value);});
    masking=true;
  });}
  const first=await ask('Create CMS admin password (at least 12 characters): ');
  const second=await ask('Repeat password: ');
  rl.close();return [first,second];
}
const [password,confirmation]=await obtainPasswords();
if(!password || password.length<12){console.error('Use at least 12 characters.');process.exit(1)}
if(password!==confirmation){console.error('Passwords do not match.');process.exit(1)}
const salt=crypto.randomBytes(16);
const digest=crypto.scryptSync(password,salt,64,{N:16384,r:8,p:1});
const hash=`scrypt$${salt.toString('hex')}$${digest.toString('hex')}`;
const envPath='.env';let env=fs.existsSync(envPath)?fs.readFileSync(envPath,'utf8'):'';
const record=`CMS_ADMIN_PASSWORD_HASH=${hash}`;
env=/^CMS_ADMIN_PASSWORD_HASH=.*$/m.test(env)?env.replace(/^CMS_ADMIN_PASSWORD_HASH=.*$/m,record):`${env.trimEnd()}\n${record}\n`;
fs.writeFileSync(envPath,env.trimStart(),{mode:0o600});
console.log('Admin password hash saved in .env. Restart npm run dev and open /admin.');
