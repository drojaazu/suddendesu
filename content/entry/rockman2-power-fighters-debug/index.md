---
title: 'Rockman 2: The Power Fighters - Debug Mode and Secret Test'
date: 2025-12-12T09:41:31+09:00
author: Ryou
images:
- img/rockman2j_title.png
category: Disassembly / Analysis
tags:
- capcom
- debug tool
- unused content
draft: false
---

The scope of research and writing for articles on this site is orders of magnitude greater than the early days, which means it now takes *foreverrrr* to get anything posted. (And that's not even counting the share of time and attention consumed by Real Life.) But let's see if we can squeak in one last quickie article before the end of the year. Let's take a look at Rockman 2: The Power Fighters (or Megaman 2, I suppose, if you're the kind of person who pronounces NES as "ness").

<!--more-->

Somewhat surprisngly and in stark contrast to [past articles](entry/lucky-wild-disabled-art-viewers-sound-test-and-round-select/) which I [thought would be quick work](entry/progear-no-arashi-debug-tools-and-code-weirdness/) but instead [blossomed into months long projects](entry/magical-crystals-debug-functions-unused-content-and-the-kaneko-toybox-system/), Rockman 2 has a couple of hidden dev features and some unused strings and... that's it, as far as I can tell. Of course there may be unused content lurking withing, but as always I leave it to fans who know the game in detail to take the tools I've uncovered and use them to find some more fun stuff.

Let's start with...

# CPS-2 Debug DIPs

[As discussed previously](entry/cps2-debug-switches-and-the-games-that-love-them/), the CPS-2 development hardware had a series of physical switches that could be used to enable/disable debugging features at runtime. And Rockman 2 does not seem to use them at all! There are no references to the debug DIP memory location (0x8040B0 to 0x8040B2) in any of the code. It's possible that they were used at one time (the debug tool that we will discuss soon shows some tenuous evidence for this) and the code referencing them was completely ripped out.

# Secret Test Menu

Like [some](entry/secret-menu-dungeons-dragons-shadow-over-mystara/) [other](entry/pocket-fighter-secret-menu-re-enabled/) CPS-2 games, this one has a SECRET TEST menu.

Note that some tools make use of a non-existant Button 4. If you're a game data research dweeb like me and have the MAME source regularly pulled and ready to compile for test builds, then this can be easily fixed by changing the `rockman2j` driver (or whatever variant you'd like) to use the `cps2_2p4b` input map. If not, you'll need to compromise on accuracy a bit and use the cheat in the Character Test section, which is the only tool where this button really matters.

For all options, press P1 Start + P1 B1 to return to the menu.


## Object / Scroll 1/2/3 Test

![](img/rockman2j_scroll1.png)

![](img/rockman2j_scroll2.png)

![](img/rockman2j_scroll3.png)

These are graphic tile viewers, similar to ones we've seen in other CPS-2 games. The controls are the same across all four viewers:

- P1 Up/Down - Scroll (Hold P1 Button 1 to scroll quickly; hold P1 Button 2 to scroll by page)
- P2 Left/Right - Change stage by 1
- P2 Up/Down - Change stage by 0x10
- P1 Left/Right - Change color palette
- P1 Button 3 - "explode" view into individual 8x8 tiles
- P1 Button 4 - Change background color
- P2 Button 1/2 - Toggle H/V flip, respectively

## Character Test

A sprite frame and animation viewer. This is the most complex tool and it took a fair bit of work to suss out all the details.

As you can see, there are lots of values that can be changed, but there's no cursor to select which fields to change. The tool instead uses different "modes" to shift what the limited number of inputs can change. There are two main modes, graphics and data, with graphics having four sub modes.

P1 Button 4 changes between the two main modes. This 



Service 1 (9) to turn the text layer on and off
Service Mode (F2) to change background color

B4 (not enabled on prod hardware) switches the data modify mode - need a cheat to get around this
should modify code @ d3fe to remove the bit 7 check (B4) and instead check a memory location for a value (which will be set by cheat)

4a2d7ff0

## Block 2/3 Test

![](img/rockman2j_block1.png)

![](img/rockman2j_block2.png)

Another graphic viewer, but this time for the fully assembled background pieces.

- P1 Up/Down - Change block number by 1
- P1 Left/Right - Change block number by 0x10
- Hold P1 Button 1 + P1 Stick - Change X/Y position
- Hold P1 Button 2 + P1 Left/Right - Change stage number
- Hold P1 Button 2 + P1 Up/Down - Change round number, when applicable

```
  <cheat desc="Secret Test Menu">
    <comment>Replaces the standard Test Menu</comment>
    <script state="on">
      <action>temp0=maincpu.oq@2f34</action>
      <action>temp1=maincpu.od@2f3c</action>
      <action>maincpu.oq@2f34=4eb90000b0ea4e71</action>
      <action>maincpu.od@2f3c=4e714e71</action>
    </script>
    <script state="off">
      <action>maincpu.oq@2f34=temp0</action>
      <action>maincpu.od@2f3c=temp1</action>
    </script>
  </cheat>

  <cheat desc="Change Character Test Graphics Mode (P1)">
    <comment>Changes the input mode in Character Test in order to access additional functionality</comment>
    <parameter>
      <item value="0x00">Default</item>
      <item value="0x01">Move Sprite</item>
      <item value="0x02">Change Stage/Course</item>
      <item value="0x04">Change Color/H-Flip</item>
    </parameter>
    <script state="change">
      <action>maincpu.pb@fffbfa=param</action>
    </script>
    <script state="off">
      <action>maincpu.pb@fffbfa=0</action>
    </script>
  </cheat>

  <cheat desc="Change Character Test Graphics Mode (P2)">
    <comment>Changes the input mode in Character Test in order to access additional functionality</comment>
    <parameter>
      <item value="0x00">Default</item>
      <item value="0x01">Move Sprite</item>
      <item value="0x02">Change Stage/Course</item>
      <item value="0x04">Change Color/H-Flip</item>
    </parameter>
    <script state="change">
      <action>maincpu.pb@fffbfc=param</action>
    </script>
    <script state="off">
      <action>maincpu.pb@fffbfc=0</action>
    </script>
  </cheat>

  <cheat desc="Toggle Character Test Data Modify Mode">
    <script state="on">
      <action>temp0=maincpu.ow@d404</action>
      <action>temp1=maincpu.od@d406</action>
      <action>maincpu.ow@d404=4e71</action>
      <action>maincpu.od@d406=4a2d7ff0</action>
      
    </script>
    <script state="off">
      <action>maincpu.ow@d404=temp0</action>
      <action>maincpu.od@d406=temp1</action>
    </script>
  </cheat>
```

# Secret Test Menu - Technical

The Secret Test itself isn't particularly interesting at a technicaly level. The code begins at 0xB0EA, fully intact and usable but not referenced anywhere. So we hijack the standard Test Menu and jump to the Secret Test and everything is working. (It should be noted that the Secret Test, with its Exit option, was probably originally accessed as an item in the standard manu, just for accuracy's sake.)

But what is a bit more interesting is the Character Test. The multitude of changeable settings in the tool necessitates some kind of control scheme beyond the three (four) buttons available. Well, there is evidence of the presence of additional inputs available during development...

Before we look at that, I'm going to rant (briefly, I hope...), as this game has one of the more annoying controller input processing schemes that I've had to deal with. Most games read the state of a controller on each [vertical blank interval](https://en.wikipedia.org/wiki/Vertical_blanking_interval) and then store that value in RAM to be used by the game logic. In 99.99999% of cases, that value is copied again and stored for later as the "previous frame value". The previous and current values are then compared in a NOT/AND pattern to determine if the input as changed since the last frame. In this way, we can register both a button press as a *hold* (e.g. continuously firing a gun in an STG) or a *tap* (dropping a limited-supply super bomb only once even though the button was held across a few frames).

Rockman 2, however, does not do this button tap calculation automatically. Any part of the game that wants to use a button tap needs to write its own code to check the difference between the current/previous values. And since that's such a common thing, we see this pattern repeated all over the place in the disassembly. It's just a couple extra opcodes so it doesn't weigh down CPU processing much, but it *is* ineffecient and I have no idea why they chose to do things this way. It proved to be a pain in the ass when I was trying to write patches.

Okay, rant over. Now let's have a look at the very start of the Character Test loop code, at 0xD2E6:

<pre class="pdasm pdasm-arch-m68k">
00D2E6: 48E7 0002      movem.l A6, -(A7)
00D2EA: 41ED 0300      lea     ($300,A5){char_test__data_block_p1}, A0
00D2EE: 116D 0050 0060 move.b  ($50,A5){input_copy_p1}, ($60,A0){char_test__input_copy_p1}
00D2F4: 116D 0051 0061 move.b  ($51,A5){input_copy_p1_prev}, ($61,A0){char_test__input_copy_p1_prev}
00D2FA: 116D 7BFA 0063 move.b  ($7bfa,A5){input_copy_unknown1}, ($63,A0){char_test__input_copy_unknown1}
00D300: 116D 7BFB 0064 move.b  ($7bfb,A5){input_copy_unknown1_prev}, ($64,A0){char_test__input_copy_unknown1_prev}
...
00D32C: 41ED 0700      lea     ($700,A5){char_test__data_block_p2}, A0
00D330: 116D 0052 0060 move.b  ($52,A5){input_copy_p2}, ($60,A0){char_test__input_copy_p2}
00D336: 116D 0053 0061 move.b  ($53,A5){input_copy_p2_prev}, ($61,A0){char_test__input_copy_p2_prev}
00D33C: 116D 7BFC 0063 move.b  ($7bfc,A5){input_copy_unknown2}, ($63,A0){char_test__input_copy_unknown2}
00D342: 116D 7BFD 0064 move.b  ($7bfd,A5){input_copy_unknown2_prev}, ($64,A0){char_test__input_copy_unknown2_prev}
</pre>

We also have this chunk of code at 0xE74E and a duplicated copy at 0xEC1C, which are called by the Block 2 and Block 3 Tests, respectively:

<pre class="pdasm pdasm-arch-m68k">
00E74E: 102D 0050      move.b  ($50,A5){input_copy_p1}, D0
00E752: 122D 0051      move.b  ($51,A5){input_copy_p1_prev}, D1
00E756: 4601           not.b   D1
00E758: C200           and.b   D0, D1
00E75A: 1B41 0362      move.b  D1, ($362,A5){input_copy_p1_tap}
00E75E: 102D 7BFA      move.b  ($7bfa,A5){input_copy_unknown1}, D0
00E762: 122D 7BFB      move.b  ($7bfb,A5){input_copy_unknown1_prev}, D1
00E766: 4601           not.b   D1
00E768: C200           and.b   D0, D1
00E76A: 1B41 0365      move.b  D1, ($365,A5){input_copy_unknown1_tap}
00E76E: 4E75           rts
</pre>

In the first case, it is copying the P1/P2 inputs to the character test work area in memory, and then it does the same for two mystery locations: 0x0FFFBFA/0x0FFFBFB for Player 1 side and 0x0FFFBFC/0x0FFFBFD for Player 2 side. (Note that all the RAM locations are represented as offsets to A5 (premanently set to 0xFF8000 during runtime) in the disassembly, which is how pretty much all CPS-2 games do their memory access.) And in the second block of code, we see it doing the NOT/AND dance mentioned before with these mystery locations, though only for the P1 side.

These are the only places in the code where these locations are referenced. The way they are treated in these examples (especially with the generation of the tap) makes clear like they were controller inputs of some sort, yet these are all reads: there are no matching writes to these locations anywhere else. The CPS-2 supports 4 players, so perhaps P3 and P4 were mapped and copied at one time during development for use with these debug tools, with all of that code excised for the final build.

The Block 2/3 tests don't actually use these values despite making a call to code that generates a tap value.


# Debug Tools



# Unused Strings


