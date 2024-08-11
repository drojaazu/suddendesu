---
title: 'Oops.'
date: 2015-02-16T19:26:00+09:00
author: Ryou
category: Article
tags:
- atari
draft: false
---

>The Atari File Management Subsystem (FMS) is the filesystem on an Atari 810 floppy disk.
>
>The 720 sectors of the disk were numbered from 1 to 720, but (perhaps due to poor communication between the different development teams at Atari) the FMS filesystem was designed to support sector addresses in the range from 0 to 719, which meant that sector 720 was not addressable but a nonexistent sector 0 was. This resulted in the filesystem only using the 719 sectors in the overlap between what is addressable and what actually exists, so sector 720 is unused (a waste of a perfectly good 128 bytes).

([Source](http://fileformats.archiveteam.org/wiki/Atari_File_Management_Subsystem))

<!--more-->