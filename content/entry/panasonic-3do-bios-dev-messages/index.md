---
title: ' Panasonic 3DO Hidden BIOS Dev Messages'
date: 2015-07-22T23:18:00+09:00
draft: false
author: Ryou
images:
- img/3do_title.png
---

Normally I'd save this to post on a rainy day, but I was so amused when I saw it that I really wanted to share it right away: it looks like those wacky 3DO firmware devs left some messages for us to find!

<!--more-->

I opened up the FZ-1 BIOS on a whim, not really expecting to find anything, but I was happily mistaken. Starting at 0x150BC in the dump, we have this glorious little nugget:

```
This WHOLLY ODD collection of code brought to you by:

Dale "You mean my house burned down last month and I never noticed?" Luck
-=RJ=- "Hey, I never approved those messages!" Mical
Joe "You were asleep at the time" Pillow
Dave "Strictly corect" Platt
Bryce "Angel of death" "Nesbitl" Nesbitt
Stephen "Not Stephan" Landrum
Andy "I miss my Cats" Finkel
Chris "Whaddya mean you took it out?" McFall
Drew "Don't touch my toys" Shell
Mr. Pockets
Nerf(tm) brand weapons
Phil "I can't hear you" Burk
Stan "I thought you were done" Shepard
Steve "That !@%$#& drive" Hayes
Bill Long
Barry Solomon

And all those who were not in the building at 2am when the cops
showed up...
```

I wasn't familiar with the names so I looked them up. [Dale Luck](https://www.linkedin.com/pub/dale-luck/1/379/4b2), [RJ Mical](https://en.wikipedia.org/wiki/Robert_J._Mical), [Dave Platt](https://www.linkedin.com/pub/dave-platt/4/52/794) and others in this list appear to be some of the main people behind the 3DO, and, arguably more importantly, behind the legendary Amiga Computer. Joe Pillow, hilariously enough, [doesn't seem to be a real person](http://news.tolmol.com/AmigaOS/news-detail/en-IN/18229391).

I freely admit I'm not knowledgeable about the Amiga (I grew up with my Atari XL's) but what I've been reading so far is fascinating. I love the fact that they included easter eggs in the Amiga and their apparent sense of humor. It makes me wonder if this is somehow loadable in the BIOS as a visible easter egg, or if it was buried like a time capsule in the compiled code.

Honestly, though, I'm quite surprised this isn't more widespread about the internets. I searched for the first line of the text, and Google returned literally one result: [this Russian forum, with a post from 2009 showing the text](http://forum.3doplanet.ru/viewtopic.php?f=17&t=1355&start=330#p120747). As such, I can't claim that I found it first, but I can't seem to find it anywhere else...

Personally, I'd like to know the story behind the cops showing up at 2 AM.
