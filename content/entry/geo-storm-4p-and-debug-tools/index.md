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

![](img/geostorm_4p_01.png)

![](img/geostorm_4p_02.png)

![](img/geostorm_4p_names.png)

The big find here is that 3/4 Player mode still exists in the game and appears to be fully functional. It's long been suspected that the game at least planned for more players due to the several references to a P3 and P4 slot in graphics. Well, it turns out it was much further along than just planning.

What is kind of crazy is that the entire 3/4 Player mode is disabled with just one command:

<pre class="pdasm pdasm-arch-nec-v">
05EE6: mov     al,0A501h{dsw2_snapshot}  ; read in the copy of DIP switch 2
05EE9: mov     dl,al  ; duplicate it into another register as a backup (for the Coin Slot type read)
05EEB: and     al,0h  ; mask the DIP 2 value with *zero*
05EED: shl     al,3h  ; move it into place...
05EF0: or      0A5A8h{cfg_flags},al ; and map it on to the config
05EF4: and     dl,4h  ; use the unmasked backup to read in Coin Slot type
05EF7: or      0A5A8h{cfg_flags},dl
</pre>

As with Yakyū Kakutō League Man and Dream Soccer '94, DIP switch 2-2 sets the cabinet type to 4 Players. In the section of startup init code shown above, the DIP switch 2 settings are loaded, masked and shifted so they can be applied to the configuration in memory. This is done twice: once for the Cabinet Type and once for the Coin Slot Type with DIP 2 stored in 2 registers since the masking is destructive.

The problem is at 0x5EEB: the mask applied to the Cabinet Type read is **zero**. This effectively wipes out the actual DIP switch 2 settings: the byte reads as zero (all switches off) no matter what the actual switch state is. This unconditionally sets the Cabinet Type to 2 Players only.

There are a couple quirks around the 3/4 Player inputs. Again using the same 4 Player settings as League Man/Soccer '94, DIP switch 1-6 acts as an "Any Button to Start" flag. Wiithout it, only the Start button would, well, start the game after inserting a coin. Why this option even exists is unknown to me, but it may have had something to do with the cabinet's input panel configuration.

In any case, similar to the code above that forces the machine to always be 2 Player, the function that determines which buttons allow the game to start masks DIP 1-6 to always be on - that is, to "Any Button to Start".

<pre class="pdasm pdasm-arch-nec-v">
05F0B: mov     al,1h
05F0D: br      5F1Ah  ; jump over the next few bytes, making the DSW 1-5 check unreachable
05F10: mov     al,0A500h  ; load DSW 1 - code never reaches this point!
05F13: and     al,20h  ; and mask off the 1-6 bit
05F15: rol     al,3h  ; prepare it to be set on the config
05F18: not     al
05F1A: mov     al,1h  ; the program flow jumped down here sets the Any Button to Start flag to 1 unconditionally
05F1C: shl     al,5h
05F1F: or      0A5A8h{cfg_flags},al
</pre>

TODO - add the any button patch to the enable 3/4 P cheat

The fix really is as easy as correcting that mask to properly single out the Cabinet Type bit. So here's a MAME cheat to do just that:

```xml
  <cheat desc="Restore 3/4 player support">
    <comment>Set DSW 2-2 to 4 Players and 2-3 to Separate. Credit players 3 and 4 with the P3 START and P4START buttons - not Coin 3 / Coin 4. Credit everyone before starting. *Needs a MAME build with 4-player inputs.*</comment>
    <script state="on">
      <action>temp0=maincpu.mb@005EEC</action>
    </script>
    <script state="run">
      <action>maincpu.mb@005EEC=02</action>
    </script>
    <script state="off">
      <action>maincpu.mb@005EEC=temp0</action>
    </script>
  </cheat>
```

As the comment says, you'll need to make sure DIP switches 2-2 and 2-3 are on, which sets Cabinet Type: 4 Players and Coin Slot: Seperate. We want seperate coin slots due to one of the quirks of the hardware: when set to a 4 Player cabinet, the lines that would normally become P3/P4 Start act as P3/P4 Coin instead. P3/P4 Start do not exist in this layout.

But now we have a bigger problem: MAME (correctly) assigned only 2 Player controls for the game, so we have no way to map inputs for the other players. One solution is to change the port layout for the game to `m92_4player` in the driver and build a custom MAME executable. Not a problem for those of us who keep the MAME source regularly pulled and updated, but I imagine that doesn't describe most people.

Another option is use a Lua script. 





## But Why?

Why was this done? I have no idea. The M92 hardware already has 4 Player games, so presumably the input I/O and harness edge were capable. While I haven't played through the whole game as 4 players (difficult to do as one person...), I haven't encountered any game breaking bugs. It seems complete: default names and alternate palettes are present; the end of mission assesment works perfectly; even the difficulty rubber banding takes into account 3 and 4 players. You'd think in a game that was famously 

One thought I had was that we have a 2 Player Only version dump, with a full 4 Player version floating around out there. That was shot down when I saw the flyer for the game.

![](img/geostorm_flyer.jpg)

The flyer *specifically* indicates 1 or 2 Player modes, both in English and Japanese. That rules out a 4 Player PCB.



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

First it checks that the system is in Service Mode via DIP switch 1-8. If that is true it then checks the byte at 0xF4AE. This is a build constant that unconditionally puts the machine in developer mode. Paired with the Service Mode requirement, this essentially turned the service switch into a developer mode toggle.

The byte at 0xF4AE is, predictably, set to 0 in the final version which prevents enterting developer mode automatically on boot. But, there's an override: holding P1 Up + P1 Button 1 on startup will also put the machine in developer mode. You can tell this works as it will skip the RAM/ROM check and go straight to the title screen. Dev tools aside, it's useful for skipping the annoyingly long boot up.

This should work on final boards without any hacking. If anyone has the board, give it a try and let us know.

## Debug Tools Enable

There's one more blocker before we get to actually use the debug tools: DIP switch 3-8 acts as a global debug tool toggle. It's not so much an access gate as much as it is a quick on/off for all the tools.

All of the debug tools in this section require switch 3-8 to be on in order to run.

## Game Pause

P2 Start pauses the game; P1 Start unpauses.

## Invincibility

DIP switch 3-6 enables invincibility for normal enemy gunfire. You can still die by falling off the map (e.g. the bossfight at the end of the the train stage).

## Gameplay Telemetry

![](img/geostorm_data_readout01.png)

DIP switch 3-7 enables a data readout at the top of the screen. All values are BCD, except the third (frame count) which reads as hexadecimal.

The first value is the stage "odometer," how far into the stage the players are.

Next is spare CPU for the frame. It's a raw 16 bit value that is increased for every loop in the idle spin in the main loop after all tasks are complete for the frame. What's interesting is the value is not cleared on each frame because it also acts as the entropy source for the RNG, which is a pretty clever way to source randomness.

That means the value itself is meaningless. What does have meaning is the *delta* between values per frame. A large change means there was lots of free time after task processing; a small change means the CPU work was saturated with task work and didn't have much time in its idle loop. To the human eye, this looks like a higher number with an idle CPU, as the count step is higher, while a heavy CPU load looks like a lower number as it takes longer to rise.

After that we have the global frame count, increased once per input read in the main loop and used for animation timing.

The next column is the free object slot count. There are 56 runtime object slots; the more entities on screen, the lower this value will be.

The final column is the game rank. This determines the gameplay difficulty, recalculated each frame on the DIP setting, the number of players, and how well armed the players are.

The data at 0x7000:6F10 is a table that determines the base rank.

| DIP difficulty | 1 player | 2 players | 3 players | 4 players |
|---|---|---|---|---|
| 0 (normal) | 04 | 05 | 06 | 07 |
| 1 (easy) | 00 | 01 | 02 | 03 |
| 2 (harder) | 08 | 09 | 0A | 0B |
| 3 (hardest) | 0C | 0D | 0E | 0F |

Additional "points" are added to the rank depending on powerups like BOOST SP are in effect. The rank feeds into enemy timing: the higher the rank, the faster certain enemy actions occur and the faster their projectiles move.

## Stage Select

![](img/geostorm_stage_select01.png)![](img/geostorm_stage_select02.png)

Possibly the most useful tool along with invincibility, or at least the most interesting. During gameplay, hold P1 Start + P1 Button 1 + P1 Button 2 and press Up. It immediately jumps to the stage select screen.

There are a couple test stages listed here, which we'll look at below.

## Mission Advance

Similar to the stage select: during play, hold P1 Start + P1 Button 1 + P1 Button 2 and press *Down*. It will show the Mission Assesment screen then move to the next area.	

## Location Test Audit Screen

![](img/geostorm_loctest_audit.png)

When the High Score screen is displayed in attract mode, hold P2 Button 2 and press P1 Button 1.

B1/B2 returns to attract mode.

I'm assuming this is specifically for a location test (as opposed to operator bookkeeping) since it's hidden behind a developer mode and an input code, . Of note here is that 3 and 4 Player modes are included as Trio and Quartet Play.

# Test Maps



# Unused Graphics

# Evidence of later stages
