---
title: 'Donpachi - Debug Tools and More'
author: Ryou
date: 2017-01-09T21:47:00+09:00
images:
- img/cover.png
draft: false
---

Happy New Year! As promised, here is the writeup on the classic Cave shooter, Donpachi. I've decided to do something a little bit different here. Instead of spending so much time writing out the technical details of my findings, I'm instead just providing an overview and MAME cheats to access them. I'll do the same with the Dodonpachi which will follow later. Later this year I'll finish up with a detailed technical article about both games. I'm doing it this way in part because the two games share a lot of code (as DDP was clearly built off of DP), and in part because I'll never get this article out the door in time otherwise. I think there's a bunch of interesting things here that fans of the game will want to play with, so I'd like to get it published sooner than later.

With all that said, here we go...

<!--more-->

# Version String

Right after the vector table at 0x400, before the code actually starts, we have this ASCII string:

```
DONPACHI Ver1.011995/05/11      
```

The version and build date run together: Ver 1.01, 1995-05-11. While not wildly interesting, we'll see how this relates to Dodonpachi in the next post.

# Sound Test Auto-play Code

![](img/donpachij-autosoundtest.png)

This is interesting. There is a code that will automatically cycle through the sound effects and play each once. I've checked the manual, and there's no mention of the code. Seems to be a useful as a way of checking for bad data, so I'm not sure why it's a hidden code instead of an obvious feature.

On the sound test screen, hold P2 Right and press P1 B2 + P2 B2 at the same time.

# Debug String

Among the strings of text data for the configufation menu, we have this line:

```
10   DEBUG MODE
```

So it looks like there was once a debug mode that could be enabled from the system menu! Of course, option 10 is replaced by enable/disable Continues in the final version. As we'll talk about in the technical writeup later, though, in the bytes containing the config settings, one bit is unused which would have been used for this debug mode, though it is no longer checked anywhere in the code.

The existence of this text is still promising, though. It at least confirms that there was debugging code in the games and that some of it may still be lurking....

# Skip Memory Check

... But before we jump in further, here's a cheat I developed that will be useful not only to data explorers but to those who play the game regularly as well. This cheat will skip the RAM/ROM check at the beginning of the game. This makes the startup much faster and prevents the memory errors that occur when you reset the game with other cheats set, which will be useful for playing with the hacks below:

**Japanese version:**

```
  <cheat desc="Skip RAM/ROM check and warning screen">
    <script state="on">
      <action>temp0=maincpu.md@34242</action>
      <action>maincpu.md@34242=4ef90003</action>
      <action>temp1=maincpu.mw@34246</action>
      <action>maincpu.mw@34246=42e0</action>
      <action>temp2=maincpu.md@3432e</action>
      <action>maincpu.md@3432e=4ef90000</action>
      <action>temp3=maincpu.mw@34332</action>
      <action>maincpu.mw@34332=081a</action>
    </script>
    <script state="off">
      <action>maincpu.md@34242=temp0</action>
      <action>maincpu.mw@34246=temp1</action>
      <action>maincpu.md@3432e=temp2</action>
      <action>maincpu.mw@34332=temp3</action>
    </script>
  </cheat>
```

**US Version:**

```
  <cheat desc="Skip RAM/ROM check and warning screen">
    <script state="on">
      <action>temp0=maincpu.md@34334</action>
      <action>maincpu.md@34334=4ef90003</action>
      <action>temp1=maincpu.mw@34338</action>
      <action>maincpu.mw@34338=43d2</action>
      <action>temp2=maincpu.md@34420</action>
      <action>maincpu.md@34420=4ef90000</action>
      <action>temp3=maincpu.mw@34424</action>
      <action>maincpu.mw@34424=081a</action>
    </script>
    <script state="off">
      <action>maincpu.md@34334=temp0</action>
      <action>maincpu.mw@34338=temp1</action>
      <action>maincpu.md@34420=temp2</action>
      <action>maincpu.mw@34424=temp3</action>
    </script>
  </cheat>
```

# Debug Tools - Pause and Stage Explore

As the text above hinted at, there are indeed debugging functions remaining in the game. They are located in two different chunks of code, so I will group them into two sections. The first debug tools we'll look are the pause and stage explore functions.

![](img/donpachij-stgadv1.png)

![](img/donpachij-stgadv2.png)

With this re-enabled code, the game can be paused with P2 Start. While paused, hold P1 Button 3 and press P1 Up or Down to scroll forward or backward through the stage. This works as a level select as well, as you can scroll into the next stage with no problem. P1 Start will unpause the game. It can also work as a slow motion function by holding P1 Start and P2 Start at the same time, though I'm not certain if this was intentional or a side effect. Here's the MAME cheat (for all regions):

```
  <cheat desc="Re-enable pause/stage advance">
    <comment>P2 Start to pause; P1 Start to unpause; While paused hold P1 B3 and press P1 Up/Down to move through the stage</comment>
    <script state="on">
      <action>temp0=maincpu.md@8a6</action>
      <action>maincpu.md@8a6=0010f000</action>
    </script>
    <script state="run">
      <action>maincpu.pb@10f000=4</action>
    </script>
    <script state="off">
      <action>maincpu.md@8a6=temp0</action>
      <action>maincpu.pb@10f000=0</action>
    </script>
  </cheat>
```

# Debug Tools - Palette and Memory Editor, Object Spawner, Stage Select

![](img/donpachij-paleditor.png)

![](img/donpachij-rameditor.png)

In the other chunk of debug code, we have several tools crammed together: a RAM editor, a palette editor, an object spawner and a stage select function. I've split the RAM editor out into its own code so it is easier to work with:

**Debug tools (Japanese version):**

```
  <cheat desc="Enable debug tools (Palette Editor/Object Spawner/Level Select)">
    <script state="on">
      <action>temp0=maincpu.md@35cbe</action>
      <action>maincpu.md@35cbe=0010f001</action>
    </script>
    <script state="run">
      <action>maincpu.pb@10f001=4</action>
    </script>
    <script state="off">
      <action>maincpu.md@35cbe=temp0</action>
      <action>maincpu.pb@10f001=0</action>
    </script>
  </cheat>
```

**Debug tools (US version):**

```
  <cheat desc="Enable debug tools (Palette Editor/Object Spawner/Level Select)">
    <script state="on">
      <action>temp0=maincpu.md@35d98</action>
      <action>maincpu.md@35d98=0010f001</action>
    </script>
    <script state="run">
      <action>maincpu.pb@10f001=4</action>
    </script>
    <script state="off">
      <action>maincpu.md@35d98=temp0</action>
      <action>maincpu.pb@10f001=0</action>
    </script>
  </cheat>
```

**RAM editor (all regions):**

```
  <cheat desc="Enable RAM editor">
    <script state="run">
      <action>maincpu.pb@1018e8=1</action>
    </script>
    <script state="off">
      <action>maincpu.pb@1018e8=0</action>
    </script>
  </cheat>
```

Though it's in the same section of code, the RAM editor is seperate from the other debug tools and a bit simpler, so let's look at it first. It consists of a bar of (hard to read) text along the bottom of the screen, with the memory address on the left and the values on the right. There is also a hexadecimal value in a larger font above the editor; I've not been able to determine it's function.

Behind the text is a cursor that is quite difficult to see. It can be moved around both the offset and value areas and wil change the address space or memory values, respectively. Use P2 joystick to move the cursor; hold P2 Button 3 and use P2 Up/Down to change values.

The rest of the debug tools are all mixed together, activated using different button inputs. Most of the visual aspect here is the palette editor, which appears as a column of text on the right side of the screen with RGB values for the sixteen colors in a given palette. Like the RAM editor, there is a cursor behind the text, though it is white here and a little easier to see. The palette and specific colors in a palette can be changed: use P2 joystick to move the cursor around; hold P2 Button 2 and use P2 Up/Down to change colors; hold P2 Button 3 and use P2 Left/Right to change palettes. Hold P1 Start and press P2 Button 3 to reset the current color line, or hold P2 Start and press P2 Button 3 to reset the entire palette.

Notice above the PAL text line, there is a small hexadecimal number display with no label. This number is used by both the object spawner and the stage select functions. To change this number, hold P1 Start and press P2 Up/Down.

Let's talk about the level select first. Set the number display to a value between 2 and 5 and press P2 Button 1 + P2 Button 2 to jump to that stage. It switches by jumping to the stage clear screen for the previous stage. So if you choose 2, you'll jump to 'Stage 1 clear,' and then move to stage 2. Note that this only works values 2 through 5! Anything higher than 5 is ignore by the code, and 1 will cause a crash and reset, due to how the code manipulates that value.

Finally, let's cover the object spawner. We'll talk about objects in more depth later, but basically, they are the components of gameplay, such as enemies or animations in a level. With the object spawner, we can create objects in game on the fly. The number display represents the object ID; it can then be spawned by pressed P2 Button 2 + P2 Button 3.

# Debug Objects

The object spawner described above is a powerful tool and useful for finding unused code. I'm not familiar enough with the game to say if there are any unused enemies or graphics, but I did come across a couple of objects that were clearly meant for the development team only. To use these items, set the object spawner display to the value listed and create the object.

## Object 0x30 - REAL_L display

![](img/donpachi-reall1.png)

![](img/donpachi-reall2.png)

This one remains a mystery to me. When spawned, it displays the text REAL_L= and a value in the lower left corner, as well as some smaller text on the upper right side. It also creates a broken tile in the middle of the screen. This tile moves slowly on its own, but can also be moved by the P2 joystick. Holding P2 Button 1 and pressing P2 Joystick will resize the tile, and we can start to see that it is actually some graphics (see the red building object in the first screenshot above).

P1 Left/Right will change the palette on this object. P1 Up/Down scrolls through the tiles inside. In this regard it's something like a tile viewer, but with broken graphics. However, things get weirder:

 - Pressing P2 Button 3 will cause powerups to spawn.
 - It will sometimes trigger the true ending scene, with the ships flying up and the weird raisin looking character falling, though totally glitched as it is still processing the gameplay too
 - It stops and moves on its own seemingly at random
 - It acts like an enemy object, and will stop shots from the player, but is never destroyed
 - It seems to reveal the hidden bonus stars and bees, though this may just be a side effect of how glitchy everything becomes

It's unclear what the REAL_L value is supposed to be; it simply increments as the level runs. If you look closely at the other 'numbers' in the upper right, you'll see that it sometimes includes non-hexadecimal numbers and blank spaces. Not sure if this is intentional or more bugs.

I've poked the code for this object a bit, but I haven't stepped through it fully. That's a project for a rainy day (or for someone else). So what exactly IS this object? It's clearly a debugging tool, of course. We've already seen that this programmer likes to cram a lot of functionality into debugging tools (e.g. the multi-purpose palette editor/object spawner/level select tool); the REAL_L object seems similar. It seems to be a tile viewer, powerup spawner, test object and possibly a way to load the end-of-game scene, all in one chaotic, seemingly broken package.

The display glitches and weird behavior may be due to not knowing how it was originally, properly called, but I'm not sure this is case. It exists as a level object, and we're using the object spawner to call it. That's a pretty straightforward and correct way to do it. Actually, I think this tool was meant to work with an older version of the code, and we're lucky it works at all. There's a little bit of evidence for this. If you look at the program data starting at 0x1F3B, part way through the text strings, you'll see these lines:

```
0x1F3B CONGULATULATIONS!!
0x1F4F ALL STAGES CLEAR!!
0x1F63 REAL_L= 
0x1F6D [ten blank lines here]
0x1F8B PRESENTED BY
0x1F99 CAVE
```

Aside from the unfortunate yet comical engrish, 'Congulatulations, All Stages Clear' is strange because it is not used in the [game ending of the final version](http://www.vgmuseum.com/end/arcade/d/donparun.htm). Right after that line we have the mysterious REAL_L text, followed by ten blank lines and 'Presented by Cave.' Though that line DOES appear in the final version, the ending credits use a seperate string table at 0x3E2CA, far away from the other game text. It's interesting that the REAL_L string appears in the middle of what appears to be an old version of the game cleared sequence. That proximity suggests that this debugging function was intended for older code.

By the way, though the two end-of-game lines above are not used in the code, the string table still has their meta data. Here's how they appear rendered in-game:

![](img/donpachi-unused-clear.png)

![](img/donpachi-unused-cave.png)

## Object 0xA0 - Flames display

![](img/donpachi-flames1.png)

![](img/1484015685_donpachi-flames2.png)

Here we have another strange debugging tool, but this one is not nearly as insane as object 0x30 above. It appears as a cursor, which can be moved around with the P2 joystick. There are three number displays in the lower left. The top two indicate the cursor X/Y position, while the bottom one indicates an offset. Pressing P2 Button 2 increases the offset value; P2 Button 3 decreases it. P2 Button 1 will make a flame animation appear at the cursor. The offset determines which flame animation is spawned.

My guess is that this was used to test flame design and placement for damaged objects. But there are still a few odd quirks here. While you can manually move the cursor, changing the offset value will also cause the cursor to move automatically up (if the offset is positive) or down (if negative, i.e. if the highest bit is set, such as by pressing P2 Button 3 to go below zero and overflow to FFFF). It will move faster depending on the size of the offset value. This means the cursor eventually scrolls off screen as you change the value.

Also, the offset value displays a whole dword, but you only change the upper two bytes with the P2 inputs. The value is stored at offset 0x20 in the object frame, and the lower bytes can be manually modified. Changing them causes the object to move left or right, as with with upper bytes for up and down, but doesn't seem to effect the type of flames that are spawned.

---

So there we go, all the interesting things I've found in the game so far. There are more bits of unused code and weird functions, but they can wait for the technical writeup later on. I can tell you now that Dodonpachi has some of these tools implemented still (such as the pause/level scroll tool), though the disassembly of that game is still ongoing.
