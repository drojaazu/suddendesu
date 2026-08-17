---
title: 'Geo Storm 4p and Debug Tools'
date: 2026-08-16T22:01:44+09:00
# author defaults to Params.author in hugo.yaml; set this only for guest posts
images:
- img/cover.png
category: Disassembly / Analysis
# Uncomment any tags that apply.
tags:
# - (developer name)
# - debug tool
# - prototype
# - unused content
# - easter egg
# - no copy warning
# - hidden credits
# - input code
draft: true
---

<!--more-->

# Four Player Mode

# Debug Tools

The game has a handful of pretty useful debug tools inside.

## Developer Mode

Everything is blocked by a global developer mode flag at e000:a65f. How that byte gets set and how it is used is kind of interesting.

<pre class="pdasm pdasm-arch-nec-v">
0E762: mov     aw,40h
0E765: mov     ds0,aw
0E767: mov     aw,[0F106h]
0E76A: out     0h,aw
0E76C: in      aw,4h   ; DIP switches on port 4, switch 1 in AL
0E76E: test    al,80h  ; check if Service Mode set
0E770: bne     0E786h  ; not in service mode -> to normal boot
0E772: test    byte ptr ps:0F0AEh{dbg__dev_mode_flag},0FFh  ; check for the "dev mode" build constant @ 0xF4AE is 0xFF
0E778: be      0E77Dh 
0E77A: br      0F462h{dbg__restart_dev_mode}  ; dev mode build flag set, restart in dev mode
0E77D: in      aw,0h  ; dev mode flag not set; check P1 input on port 0
0E77F: cmp     al,77h  ; check for P1 Up + P1 Button 1
0E781: bne     0E786h
0E783: br      0F462h{dbg__restart_dev_mode}  ; restart in dev mode if inputs matched
</pre>

First it checks that the system is in Service Mode via DIP switch 1-8. If that is true it then checks the byte at 0xf0a. This is a build constant that puts the machine in developer mode. Paired with the Service Mode requirement, this essentially turned the service switch into a developer mode toggle.

The byte at 0xf0a is, predictably, set to 0 in the final version which prevents enterting developer mode on boot. But, there's an override!

Right below the check for Service Mode and build constant check is an input query on P1 Up + Button 1. If that input combo is held on startup and Service Mode is set, the game boots in developer mode.

And this is present on the final board, available without any hacking!

It is immediately useful: it skips the ROM/RAM check entirely and goes straight to the title screen. The game is now in developer mode...  so what's available?

## Dev Tools Enable

Runtime debugging tools are controlled by DIP switch 3. The most important is switch 3-8, as this the global tool on/off switch.

Switch 3-7 adds an data readout to the very top of the screen, while 3-6 is invincibility.

## Data Readout

## Invincibility

## Stage Select

![](img/geostorm_stage_select01.png)![](img/geostorm_stage_select02.png)

## Stage Advance


## Location Test Audit Screen

![](img/geostorm_loctest_audit.png)

# Test Maps



# Unused Graphics

# Evidence of later stages
