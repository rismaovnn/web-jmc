#!/usr/bin/env python3
"""Extract native-resolution frames and package browser-friendly horizontal atlases.

Requires FFmpeg/ffprobe, Pillow. A single 190 x 720px-wide atlas would exceed
common browser GPU texture limits, so native atlases are paginated and the
complete horizontal overview is offered separately for visual indexing.
"""
import argparse
import json
import math
import shutil
import subprocess
from pathlib import Path
from PIL import Image


def cmd(*args):
    return subprocess.check_output(args, text=True)


def convert(mp4: Path, output: Path, per_page: int = 8, full_sheet: bool = True):
    probe = json.loads(cmd('ffprobe','-v','error','-select_streams','v:0','-show_entries',
                           'stream=width,height,avg_frame_rate,pix_fmt,nb_frames:format=duration',
                           '-of','json',str(mp4)))
    track = probe['streams'][0]
    width,height = track['width'],track['height']
    rational=track['avg_frame_rate'].split('/')
    fps=float(rational[0])/float(rational[1])
    alpha='a' in track.get('pix_fmt','').lower()
    output.mkdir(parents=True,exist_ok=True)
    frames=output/'frames'
    atlases=output/'assets'/'atlases'
    frames.mkdir(parents=True,exist_ok=True)
    atlases.mkdir(parents=True,exist_ok=True)
    pix_fmt='rgba' if alpha else 'rgb24'
    subprocess.run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-y','-i',str(mp4),
                    '-map','0:v:0','-vsync','0','-pix_fmt',pix_fmt,'-compression_level','6',
                    str(frames/'frame_%04d.png')],check=True)
    items=sorted(frames.glob('frame_*.png'))
    if not items:
        raise RuntimeError('No frames decoded')
    mode='RGBA' if alpha else 'RGB'
    num_pages=math.ceil(len(items)/per_page)
    for page in range(num_pages):
        page_frames=items[page*per_page:(page+1)*per_page]
        tile=Image.new(mode,(width*len(page_frames),height))
        for i,f in enumerate(page_frames):
            with Image.open(f) as im:
                tile.paste(im.convert(mode),(i*width,0))
        tile.save(atlases/f'atlas-{page:02d}.webp','WEBP',quality=94,method=5)
        tile.close()
    # Full timeline as ONE horizontal sprite (thumbnail resolution, inspect-only)
    thumb_width=72
    thumb_height=round(height*thumb_width/width)
    overview=Image.new(mode,(len(items)*thumb_width,thumb_height))
    for i,f in enumerate(items):
        with Image.open(f) as im:
            overview.paste(im.resize((thumb_width,thumb_height),Image.Resampling.LANCZOS),(i*thumb_width,0))
    overview.save(output/'assets'/'all-frames-horizontal.png',optimize=True)
    overview.close()
    if full_sheet:
        # Archival single horizontal atlas: generated outside the runtime /assets
        # folder because browser/GPU maximum texture width is usually much smaller.
        # Use decoded original pixels at native source resolution with no resizing.
        native_strip=Image.new(mode,(len(items)*width,height))
        for i,f in enumerate(items):
            with Image.open(f) as im:
                native_strip.paste(im.convert(mode),(i*width,0))
        native_strip.save(output/'all-frames-horizontal-fullres.png',compress_level=4)
        native_strip.close()
    center_index=min(round(104*(len(items)-1)/189),len(items)-1)
    with Image.open(items[center_index]) as neutral:
        neutral.save(output/'assets'/'poster.png',optimize=True)
    metadata={
      'version':1,
      'source':{'width':width,'height':height,'fps':fps,'frameCount':len(items),
                'durationSeconds':float(probe['format']['duration']),'hasAlpha':alpha,
                'originalFrameFormat':'PNG','nativeAtlases':'WebP quality 94',
                'note':'Video has no transparency' if not alpha else 'Source contains alpha'},
      'atlas':{'tileWidth':width,'tileHeight':height,'framesPerPage':per_page,
               'pageCount':num_pages,'pageUrlPattern':'atlases/atlas-{page:02d}.webp',
               'pages':[{'url':f'atlases/atlas-{p:02d}.webp',
                         'firstFrame':p*per_page,
                         'frameCount':min(per_page,len(items)-p*per_page),
                         'width':width*min(per_page,len(items)-p*per_page),'height':height}
                         for p in range(num_pages)]},
      'frames':[{'index':i,'file':f'frame_{i+1:04d}.png','timeMs':round(i*1000/fps,2),
                 'page':i//per_page,'local':i%per_page} for i in range(len(items))],
      'poseMap':{
        'center':center_index,
        'labelsAutomaticallyInferred':False,
        'left':{'frames':[104,100,95,90,84,76,67,59],'coverage':'recorded'},
        'right':{'frames':[104,108,114,120,124],'coverage':'limited/partly upward'},
        'up':{'frames':[104,115,128,145,160,180],'coverage':'recorded'},
        'down':{'frames':[104,102,100],'coverage':'near-neutral; no actual down look'},
        'idleFrames':[99,100,101,102,103,104,105],
        'notes':'Eyes hidden by VR visor; original video has no independent eye track.'
      },
      'archivalFullResolutionSheet':{'file':'all-frames-horizontal-fullres.png','width':len(items)*width,'height':height,'runtimeCompatible':False},
      'overview':{'url':'all-frames-horizontal.png','tileWidth':thumb_width,
                  'tileHeight':thumb_height,'browserOptimized':True,
                  'previewOnly':True},
      'quality':'Per-frame PNG files retain original 720x1280 decoded resolution. Playback atlases use visually high-quality WebP compression.'
    }
    # Semantic mapping is curated for the supplied footage; scale when reusing the
    # processing script to keep indices in range (not a substitute for relabeling).
    scale=lambda i: min(len(items)-1,round(i*(len(items)-1)/189))
    for key in ['left','right','up','down']:
        metadata['poseMap'][key]['frames']=[scale(i) for i in metadata['poseMap'][key]['frames']]
    metadata['poseMap']['idleFrames']=[scale(i) for i in metadata['poseMap']['idleFrames']]
    (output/'assets'/'manifest.json').write_text(json.dumps(metadata,indent=2),encoding='utf-8')
    print(json.dumps({'frameCount':len(items),'pageCount':num_pages,
                      'nativeFrame':f'{width}x{height}','alpha':alpha,
                      'originalFrames':str(frames)},indent=2))
    return metadata

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('input',type=Path)
    parser.add_argument('--out',type=Path,default=Path('build'))
    parser.add_argument('--frames-per-page',type=int,default=8)
    parser.add_argument('--skip-full-sheet',action='store_true',help='Skip archival, very wide native-resolution horizontal PNG')
    opts=parser.parse_args()
    convert(opts.input,opts.out,opts.frames_per_page,not opts.skip_full_sheet)
