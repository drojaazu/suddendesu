---
title: 'Alien vs Predator: Debug tools'
date: 2025-02-27T00:44:27+09:00
author: Ryou
images:
- img/cover.png
category: Disassembly / Analysis
tags:
- capcom
- debug tool
- unused content
draft: false
---

We're back on our CPS2 jam, this time looking at Alien vs Predator. Buried in its code are a bunch of debugging tools. Things were actually blessedly straightforward this time, compared to the mess that was Progear no Arashi, so let's get into it.

<!--more-->

# Test Menu

![](img/avspj_testmenu.png)

As with several other CPS2 games, there is a hidden test menu in the game. It is accessed relatively easily by setting the byte @ 0xFF21AA to 2 while the standard test menu is active.

in all menus, p2 start changes background color. a single press makes a "big" change, while holding it changes the hue in a gradient

## Character Test

![](img/avspj_chartest01.png)

![](img/avspj_chartest02.png)

![](img/avspj_chartest03.png)

![](img/avspj_chartest04.png)

Here we have a tool for viewing the variety of characters in the game, both players and enemies. It has a variety of functions spread across three modes. It's a complex tool that makes use of all four inputs.

### General Controls

These inputs work across all three modes:

 - P1 Start changes the mode.
 - P1 Coin cycles the background between flat color, grid and the stage, with and without the text overlay for each of these. (This is interesting because I've never seen a debug tool make use of the coin trigger before. But at the hardware level it is just anotehr switch, and whatever interface the developers were using, it was probably just another button.)
 - P3 B3 changes the color palette (the STAGE value). This also determines which stage background is displayed in the background for the previous option, though the palette is often incorrect.
 - P4 Start highlights the "CHR 1" text, and then P4 B2/B3 cycle palette.
 - P3 B2 changes the layer on which the sprites are drawn. This is indicated in the upper right as o123 and 1o23. Basically, it determines if the text over is drawn in front of or behind the sprites.

### Mode 1 - CHAR TEST

The basic character viewer. Most of the commands here work in the other modes as well:

 - P1 Up/Down changes the Patttern. Hold P2 B4 to change this value quickly.
 - Hold P1 B2 and use P1 Up/Down to change the TBL No. (the grouping of patterns)
 - Hold P1 B1 to play the animation, if the current pattern has one. P1 B3 advances to the next single frame of animation. Holding P2 B4 and using P1 B3 plays the animation quickly. The difference between P1+B1 and P2+B4/P1-B3 is that the former will play the animation with its timings while the latter will play each frame with no delays.
 - P1 B2 resets the animation to its initial frame.
 - P4 B1 changes the weapon held by the character
 - P3 Up/Down changes the vertical flip; P3 Left/Right changes the horizontal flip. Note that when in CHAR TEST2 mode, this controls the second character only. However, P1 Left/Right will also change the horizontal flip for the first character in any mode.

also p3 b2 + p2 stick moves the char test2 sprite

### Mode 2 - CURSOR MV

This mode moves the cursor around the screen, represented by a white plus sign. It also displays an orange plus sign, presumably indicating the bottom point of the character. The white cursor can be moved by the P2 stick. Holding P2 B1 and moving the stick causes the cursor to "expand" and form a bounding box. The position and size of the box are indicated in the CURSOR section of text in the upper right. P3 B1 will reset the cursor to its initial position.

This may have been used to measure hit boxes on sprites.

### Mode 3 - CHAR TEST2

This mode spawns a second sprite that can be configured independently of the first. The controls mostly mirror those in the normal CHAR TEST mode but mapped to the P2 controls.

P3 stick changes the mirror/flip for the second sprite; P2 Left/Right also changes the mirroring.

The second sprite can be positioned on the screen, something that is not possible with the first sprite. Hold P3 B2 and use P2 stick to move the second sprite around.

P3 Start changes the priority between the two sprites (that is, determines which displays in front of the other).


## Scroll 1/2/3 Block Test

![](img/avspj_blocktest01.png)

![](img/avspj_blocktest02.png)

![](img/avspj_blocktest03.png)

These three tests are very similar, so I have grouped them together here. They display various large, static tilemaps: stage backgrounds and cutscene images and such.

The controls are helpfully displayed on the screen, so there's not much to discuss here on that topic.

Scroll 1 only has the "Recycle It" and Q-Sound screens while scroll 2 and 3 have the interesting graphics. Scroll 2 also has a Hit Mode, which displays the collision markers for that particular block.

## Scroll 2/3 Move Test

![](img/avspj_movetest01.png)

![](img/avspj_movetest02.png)

![](img/avspj_movetest03.png)

Once again, these two tools are nearly identical so I have grouped them together.

The Scroll Move tests are similar to the Scroll Block test in that they display the stage backgrounds, but here we see them assembled and as they appear in the game. Scroll 2 is the intermediate background layer, while Scroll 3 is the far background.

Here too the controls are printed on the screen. They are mostly identical for both, though Scoll 2 once again has the hit mode toggle that displays the collision.

## Scroll 2&3 Move Test

![](img/avspj_scroll23_01.png)

![](img/avspj_scroll23_02.png)

If we think of the two previous sections as graphics viewers that start with foundational pieces (Block Test) then advance to seeing those pieces assembled (Move Test), we can think of this tool (Scroll 2&3 Move Test) as the progression of that pattern.

This tool combines the scroll 2 and scroll 3 background layers with their parallax scrolling, presented just as they would be in the final game. The tool consists of a movable cursor (controlled with P1 Stick) and a number indicating the ID of the displayed scene. P1 Button 2 advances the scene ID, while P1 Button 3 toggles free movement and collision.


## VRAM Serifu


## Queen Char

![](img/avspj_queen01.png)

![](img/avspj_queen02.png)

![](img/avspj_queen03.png)

Remember [KiSS dolls](https://en.wikipedia.org/wiki/Kisekae_Set_System) from the old internet? That's kind of what we have here: a tool to arrange the individual parts of the queen alien.

p1 start cycle through body sections
p1 b1 cycle through body parts
p1 b2/b3 increase/decrease the Number
p1 stick move the body part position

p2 b1 toggle text overlay


## PL/EM Catch Mode


![](img/avspj_nagetest01.png)

![](img/avspj_nagetest02.png)

![](img/avspj_nagetest03.png)

![](img/avspj_nagetest04.png)

p1 up/down chage pattern number
p1 b1 play animation in loop
p1 b2 reset animation
hold p1 b2 + p1 up/down change table number
p1 b3 advance animation on frame
p1 start toggle text overlay

p2 up/down change opponent id


# Scratchpad

# Alien vs Predator

https://twitter.com/suddendesu/status/1503361292077506560

# Debug DIPs

Interestingly, this games does not seem to use [the CPS2 debug DIP switches](/entry/cps2-debug-switches-and-the-games-that-love-them/). There are no references in the code (as far as I can tell) to the hardware mapping for the switches. However, there are a number of debugging functions that are activated at the bit level, so it's likely that the code to read from the switches was removed while the debugging functions that may have used them remain.

TODO: not sure the bits atatement above is true...

# Debug Tools

0xff81d8 when non-zero, pressing p1/2 start suicides that player
TODO: does it do anything else?

looks like both 0xff81d8 and 0xff81dc must be non-zero to access other functions in subroutine @ 0x144a


mmmmmokay....

0xff81d8 looks to be the general "debug enable" for code @ 0x144a

The code at 0x1434 is interesting. It will set bit 0 of 0xff81d8 when bit 0 of 0xff806c is set. 0xff806c/6d/6e aer bytes that represent a binary state of inputs pressed for p1/p2/p3. That is, when an input is pressed, it sets or clears that bit. The code to do this bit state work is within 0x144a, specifically beginning at 0x1468. What is interesting is that 0x144a is conditional on 0xff81d8 being non-zero. That is, teh code to set the bit to enter the function is within that function, meaning it can't be normally called anyway... reasons for this?

Code at 0x12d6 is blocked by an rts. Copies ff81d9/da/db to 0xff806c/6d/6e
This was *probably* the copy of the debug dip mirrors (ff81d*) to the soft dips (ff806*)

---

Okaaay...

The "soft dips" were enabled/disabled by P4 B2+B3 (same time)

Bit zero of DIP 0 (soft or hard) enables the object spawner
However, it will not work if Soft DIPs are enabled, since they share use of P4 inputs


DIP 1
bit 0 - enables other debug tools; enables spawner (controller by P4); enables player suicide (with Start)
bit 1 - checked within code beginning b1998, which seems to be uncalled...? - when hacked in, shows a dump of hex on the right side of the screen
bit 2 - checked within code beginning b1866, which seems to be uncalled...? - when hacked in, like above, shows some hex on the left side

3 - 7 look to be unchecked

DIP 2
0-4 unchecked
5 - tested within code @ 03a5cc, which is called through a maze of functions above that we haven't unraveled yet
6 - display stage collision/boundaries
7 - display hitboxes

DIP 3
0 - unchecked
1 - when set, computer controlled players do nothing during attract mode gameplay demo sequences
2 - checked within code beginning b1a84, which seems to be uncalled...?
3 - disables timer countdown in the "break control box" special stage
4 - displays two numbers on the right side, may possible be CPU load; number goes higher and turns red when spawning many entities
5 - shows the x/y position of the cursor for the spawner
6-7 unchecked

TODO: need to find a better way to get the uncalled debug functions hacked in...




# Alt credits

credits @ 0x15ac8 appear to be used

but there is anotehr set @ 0x98850 that is slightly different. Unused?

The data at 0x98850 is referenced by code beginning 0x9871a, which is in turn listed in a ptbl at 0x1bc28

The normal staff roll is called from 0x157d2, as a direct jump. So the calling methods are different.




---



