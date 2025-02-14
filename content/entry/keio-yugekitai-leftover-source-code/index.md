---
title: 'Keio Yugekitai Leftover Source Code'
date: 2025-02-08T00:50:10+09:00
author: Name
images:
- img/cover.png
category: Disassembly / Analysis
tags:
- [developer]
- debug tool
- prototype
- unused content
- easter egg
- copy warning
- hidden credits
- input code
draft: true
---

We can learn a lot from disassembling game data, but we learn *so much more* from source code. Source code, however, is extremely rare, especially for retro games, especially especially for Japanese games. So when we find source, it's a real treat to examine it. And today we're going to look at some source code for Keio Yugekitai for teh Sega Mega CD, known in the west as Keio Flying Squadron.

<!--more-->

We kind of buried the lede with that introduction, so let's start from the beginning. We do not have the complete source code for Keio Yugekitai, but there are relatively large chunks of it tucked away in the data of some files on the disc:

![](img/keio_example_hex.jpg1)

Moreover, the game was released in three regions, each one being a different build, so each version has different bits of source code. And! There were two demo versions, one for Japan and one for Europe, with their own different source code. So altogether we have five discs to look at!

We'll take a look at the source code and other leftover text in the files on these discs while discussing some concepts relating to assembly language programming, and what it all means for fans of the game.





It would be *awesome* to find some code with symbols/labels that we can compare to the actual binary and maybe find the name of one of those "forbidden" Mega CD library calls...


# Symbols


# Source Code

Let's begin on the Japan Final version, in file `dk3.bin`:

Japan Final - dk3.bin

```
		;*** Scroll Chararcter Work ***
		lea.l	EnemyChrWork(pc),a5
		move.w	#EneWrkMax-1,d0
sccl01:		move.w	d0,-(sp)
		move.w	(a5),d1
		andi.w	#StsScrBit,d1
		beq	sccj01
		move.w	ChrY(a5),d0
		bsr	WhereScrBlock
		bcc	sccj01
	if	EnemyDebug
		subq.w	#1,ChrX(a5)
;		add.w	d0,ChrY(a5)
	else
		lea.l	MapScrAdd(pc),a1
		asl.w	#2,d0
		lea.l	(a1,d0.w),a1
		move.w	(a1)+,d0
		add.w	d0,ChrX(a5)
		move.w	(a1)+,d0
		add.w	d0,ChrY(a5)
	endif
sccj01:		move.w	(sp)+,d0
		lea.l	ChrSize(a5),a5
		dbra.w	d0,sccl01
sccj02:		rts
*************************************************************************
*									*
*	指定キャラクタが現在どのスクロール位置にいるか調べる		*
*									*
*************************************************************************
*	in	d0 = Ｙ座標
*	out	d0 = スクロール位置
*		c : ok  cc : bad
*	break	d0
WhereScrBlock	equ	*
		movem.l	d1-d3/a0-a2,-(sp)
		lea.l	MapAScrWork(pc),a2
		move.w	CutSize(a2),d2		* d2 Cut Size
		addq.w	#1,d2
		move.l	MapCu
```

This is a good place to start and is useful as an introduction to some assembly language concept.

## Subroutine Comments

Here we have the tail end of one function and the beginning of another, called `WhereScrBlock`. In C or JavaScript or many other high level languages, a function might be declared something like this:

```
return_type FunctionName(arg1, arg2)
	return_type out = arg1 + arg2
	return out
```

We can see that it takes two values, does some kind of work, and returns a value back to us. Some languages are more explicit, indicating if those values passed to the function are mutable and example what type of data is returned. The point here is that we, as humans, can easily identify all the pieces going in and coming out.

In assembly, we have no such concept of a function definition. It's much more difficult to write "[self-documenting code](https://en.wikipedia.org/wiki/Self-documenting_code)" at such a low level, so we need to explain to those who see our code what our intention is, what goes in, what comes out, and what gets broken along the way. This helps not only those who use our code but our future selves when we revisit some code for bug fixes weeks or months later.

So here, the header comment above says that it "finds at which scroll position the specified character is currently located." Below that we have the in parameters, out parameters and the break list. The in and out parameters are pretty simple to understand: they are the arguments to the function and the values it returns. Here, it says the Y coordinate will be expected in the D0 register, and the scroll position will be available in the D0 register when complete. It also says the Carry flag will be set if there were no problems and will be cleared if there was an error.

## Break List

Finally, it says that register D0 will be "broken." The break list, also called the clobber list, is a list of all registers that will be modified by the function at some point.

In `WhereScrBlock` above, it's pretty obvious that D0 will be modified since it will hold the output value, but let's say we have a more complex function. In this supposed function, D0 is used but some additional storage space is needed to do some calculation. You could use some space on the stack, but RAM allocation is quite slow compared to register access, and if this code is part of a tight loop or a time critical part of the program (like the HBLANK phase), you need to optimize for every clock tick. So you decide to use the much faster CPU registers, and choose register D1.

This means that D1 will not have the same value with which it entered the function. Since it is not the return value, we call this a side effect. In the comments, we warn those who intend to call this function that register D1 will be broken. So if they're using D1 for their own code, they first need to push it on to the stack to preserve it.

## Symbols

Now what about the subroutine above it? Its beginning is cut off, so we don't know what its called. Skipping ahead a little bit, there are also several large symbol lists within the Keio Yugekitai data. In programming, a *symbol* is any named component that is stored somewhere in memory. This can of course mean variables but also subroutine names. In the example above, `WhereScrBlock` is a symbol which will eventually be located somewhere in the final program code.

When a program is compiled, symbols are no longer necessary in the output binary. This is because symbols are for human understanding and are not used by the machine itself, which only understands memory addresses in binary. Thus, symbols are stripped and we are left with a blob of binary data that runs on the machine. This is why whendoing a disassembly there are no variable or function names and we have to infer what everything does.

To aid in debugging, especially when dealing with embedded hardware like a retro game console, symbol lists were often generated during the build process which listed the memory location of all symbols within the final binary. That way the developer could set a breakpoint at an address that corresponded to a certain subroutine, or could debug a system crash by seeing where the CPU had an issue and deduce in what part of the code there was a problem.

Such symbol lists appeared in a few of the Keio files. If we have a look at `keio6.bin` on the Japan Final version, we see our subroutine:

```
 FFFF85D2  WhereScrBlock
```

It tells us the code begins at 0xFF85D2, which is within Work RAM on the Main CPU side, which is exactly where we would expect to find it. Now this address is actually incorrect, and we'll discuss that next, but what we're interested in is what is listed around it:

```
FFFF82E0  SearchWork
FFFF84FA  VecSwap
FFFF858A  ScrollChrWork
FFFF85D2  WhereScrBlock
FFFF8AE6  PlayerDeadDemo
FFFF8B46  OptTurnUp
FFFF8BF8  OptMove
```

The symbol appearing directly before it is `ScrollChrWork`, which is almost certainly the name of the routine that is cut off in our example code. Indeed, there is a comment there that seems to confirm it:

```
;*** Scroll Chararcter Work ***
```

In this way, symbol tables become *extremely* useful with disassembly. Even just the name of a routine can be a huge clue in figuring out what it does and how it works.

But we still have to be careful. As I just commented, the address for `WhereScrBlock` in this list is incorrect, which means all the addresses are incorrect. How do we know this? Well, to start, if we check out 0xFF85D2, the code there does not match what we have in our source listing. So we'll have to search the disassembly using some relatively unique code that appears in our listing. Say, `addq.w #1,d2`. Not exactly uncommon code, but different enough that we would hopefully only get a handful of hits when searching for it. We check the matches, looking for code that is identical to our source, and we eventually find it at 0xFF8614.

The symbol list is likely from an earlier version, so the offsets don't match our final release. But the symbol list is still invaluable: while the length of the code might have changed, it's unlikely that the order of the subroutines would change. Therefore we can say within the disassembly that the subroutine following `WhereScrBlock` is probably `PlayerDeadDemo`, and `OptTurnUp` after that, and so on.

Can we find this code in the actual game? Yes! We just need to capture the data from the running game, load that into a disassembler like IDA Pro or Ghidra, and search for one of those lines of code. We could dump the entire 16 megabytes of M68000 address space, but this is where knowing the hardware saves time. On the Mega CD, game code (especially "permanent" routines like the game engine) is located in Work RAM, from 0xFF0000 to 0xFFFFFF on the Main CPU side. So we dump that region of memory and examine it. And after some short investigation, we find that WhereScrBlock is located at 0xFF8614 in the Japan final version.




According to the symbol list in keio6.bin:



WhereScrBlock should be located at 0xFF85D2, which will be on the Main side since 0xFF0000 and high is Work RAM for the Main side. However, this offset isn't accurate, so it is likely from an older build. However, after having a look at the disassembled contents of Work RAM, we see that WhereScrBlock is actually located to 0xFF8614 in the Final JP version.

ff8614



Japan Final - keio1.bin

```
ブルーチン			*
*									*
*************************************************************************
*	In	d1.w	0 : ダメージ時
*			1 : 死んだ時
*************************************************************************
*									*
*	敵キャラが死んだとき呼ばれるサブルーチン			*
*									*
*************************************************************************
DeadSubTab	equ	*
		dc.l	DeadKoya	; 1
		dc.l	DeadBos		; 2
		dc.l	DeadUshi	; 3
		dc.l	DeadOchya	; 4
		dc.l	DeadSubMarine	; 
```

Here we have a pointer table to code, called `DeadSubTab`. The description text reads, "Subroutine called when an enemy character dies," and above it it indicated that these subroutines take D1 as an argument, where 0 indicates the enemy has been damaged and 1 indicated the enemy has died.

[TODO seems a bit incongruous, routines say Dead, description says its for dead characters, so why the modifier for damage?]

Japan Demo - keio2.bin

```
押されているか調べる
	xdef	EneHit
******[ External Symbol ]********
	;**** func ****
	xref	MoveCalcVec
;	xref	MoveCalcVec8
	xref	HitCheck
	xref	ChrFormPut
	xref	ChrWorkClr
	xref	SearchWork
	xref	SearchChrWork
	xref	GetShotBut
	xref	GetBomBut
	xref	GetAtkBut
	xref	GetKeyVec
	xref	ChgVec64
	xref	DamageEnemy	* 弾が当った時の処理
	xref	ClearMemory
	xref	Sin,Cos
	xref	HEneCheck
	xref	HEneShotCheck	* 敵キャラ弾接触チェック
	xref	VTransSetDma,VTransGo
	xref	BGTop
	xref	SEOut,SEOutP
	xref	GetPointVec
	xref	TurnUpSLevUp	* ショットレベルＵＰのアイテムを出現させる
	xref	Random
	xref	HomSearchEnemy
	xref	ShotClear
	xref	HomingFast,HomingNext,MyHomingNext
	xref	EneScrCheck
	xref	RedOut,ColorRet
	xref	
```

"Find out if [] is being pushed"

The xref commands here are like the `extern` keyword in C, indicating that these functions are not in this file but will be present when everytyhing is linked together.


```
**********************************************************
*									*
*		      敵、弾に当たった瞬間の処理			*
*									*
*********************************************************
```



"Enemy, handling the moment it hits the bullet"




Japan Demo - keio3.bin


```
0x00005144 *************************************************************************
0x0000518f *									*
0x0000519c *	慶応遊撃隊　　−天津船編−					*
0x000051c0 *									*
0x000051cd *					ステージごとの特殊処理		*
0x000051ee *									*
0x000051fb *				92.6.19 (Fri) Version 1.00 T.Yamaki	*
0x00005227 *									*
0x00005234 *************************************************************************
0x00005281 stage	group
0x0000528e 	section	map,stage
0x000052a4 	include	flags.i
0x000052b6 	include	keio.i
0x000052c7 	include	equates.i
0x000052db 	include	macro.i
0x000052ed 	include	scroll.i
0x00005300 	include	pat1.i
0x00005311 	include	enemy.i
0x00005323 	include	cmu.i
0x00005333 	include	se.i
0x00005342 	include	syswrk.i
0x00005359 ***********[ Public Symbol ]**********
0x00005383 	;**** routine ****
0x0000539a ;	xdef	MapEffect
0x000053ac 	xdef	EffStage1
0x000053bd 	xdef	MapInitialize1
0x000053d5 ***********[ External Symbol ]**********
0x00005401 	;**** routine ****
0x00005416 	xref	CrtOn,CrtOff
0x0000542a 	xref	VramTrans
0x0000543b 	xref	Vsync,Scroll
0x0000544f 	xref	EnemyClear
0x00005461 	xref	VTransGo
0x00005471 	xref	PalTop,MoveMemory
0x0000548a 	xref	CramTrans
0x0000549b 	xref	CheckOrders2
0x000054af 	xref	VTransSetDma
0x000054c3 	xref	fadectl
0x000054d2 	xref	MpABlkTab
0x000054e3 	xref	BosMusStart
0x000054f6 	xref	SEOut
0x00005505 	;**** work ****
0x00005519 	xref	TSWork
0x00005527 	xref	BGTop
0x00005534 	xref	ScrCnt
0x00005542 	xref	EneTabTop	* 敵キャラ発生テーブル
0x0000556a 	xref	EnemyMax	* 敵キャラの画面上の数最大値
0x00005597 	xref	EnemyCnt	* 敵キャラの画面上の数
0x000055be 	xref	EnemyOdr
0x000055ce 	xref	HScrBuf
0x000055dd 	xref	BosDead
0x000055ec 	xref	ScrStop
0x000055fd 	xref	PalWait1,PalWait2,PalWait3
0x0000561f 	xref	PalCnt1,PalCnt2,PalCnt3
0x00005646 Mp1PanmSpd	equ	8
0x00005658 AnmStart	equ	12290	; パレットアニメストップ
0x00005685 AnmStop		equ	13312	; パレットアニメストップ
0x000056b4 *************************************************************************
0x000056ff *									*
0x0000570c *	マ　ッ　プ　１　の　イ　ニ　シ　ャ　ラ　イ　ズ			*
0x00005742 *									*
0x0000574f *************************************************************************
0x0000579c MapInitialize1	equ	*
0x000057b4 		ori.w	#IntStageBat,IntEffect
0x000057d6 		move.w	#1,PalWait1	; パレットアニメ１のウエイト
0x00005809 		move.w	#1,PalWait2
0x0000581f 		move.w	#1,PalWait3
0x00005835 		clr.w	PalCnt1		; パレットアニメ１のポインタ
0x00005864 		clr.w	PalCnt2
0x00005875 		clr.w	PalCnt3
0x00005886 		clr.w	TraiCnt		; １ＵＰの為のたらいカウンタ
0x000058b7 		rts
0x000058c2 *************************************************************************
0x0000590d *									*
0x0000591a *		マ　ッ　プ　１　の　特　殊　処　理			*
0x00005945 *									*
0x00005952 *************************************************************************
0x0000599f EffStage1	equ	*
0x000059b2 		;**** ボスの音楽スタート ****
0x000059d3 	if	DiscFlag
0x000059e3 		cmpi.w	#13200-60*2,ScrCnt
0x00005a00 		bne	m1ej10
0x00005a10 		bsr	BosMusStart
0x00005a27 		;**** びっくりしたー ****
0x00005a46 m1ej10:		cmpi.w	#4600,ScrCnt
0x00005a64 		bne	m1ej11
0x00005a74 		move.w	#SEbikuri,d0
0x00005a8b 		bsr	SEOut
0x00005a9a 		;**** 何、あれ？ ****
0x00005ab5 m1ej11:		cmpi.w	#13750,ScrCnt
0x00005ad4 		bne	m1ej12
0x00005ae4 		move.w	#SENani,d0
0x00005af9 		bsr	SEOut
0x00005b06 m1ej12:
0x00005b13 	endif
0x00005b1b 		;**** スクロールフラグの操作 ****
0x00005b42 		lea.l	TSWork,a0
0x00005b55 		lea.l	TSBRegs(a0),a1		; flag 0
0x00005b79 		move.w	ScrCnt,d0
0x00005b8f 		cmpi.w	#768,d0
0x00005ba1 		bne	m1ej02
0x00005baf 		move.w	#1,(a1)
0x00005bc3 		clr.w	Mp1PalAnm
0x00005bd6 		clr.w	Mp1NPos
0x00005be7 		move.w	#1,Mp1Wait
0x00005bfc 		bra	m1ej01
0x00005c0c m1ej02:		cmpi.w	#1024,d0
0x00005c26 		bne	m1ej03
0x00005c34 		move.w	#2,(a1)
0x00005c46 		bra	m1ej01
0x00005c56 m1ej03:		cmpi.w	#1280,d0
0x00005c70 		bne	m1ej04
0x00005c7e 		move.w	#3,(a1)
0x00005c90 		bra	m1ej01
0x00005ca0 m1ej04:		cmpi.w	#4096,d0
0x00005cba 		bne	m1ej05
0x00005cc8 		move.w	#4,(a1)
0x00005cda 		bra	m1ej01
0x00005cea m1ej05:		cmpi.w	#5376,d0
0x00005d04 		bne	m1ej06
0x00005d12 		move.w	#5,(a1)
0x00005d24 		bra	m1ej01
0x00005d34 m1ej06:		cmpi.w	#8704,d0
0x00005d4e 		bne	m1ej07
0x00005d5c 		move.w	#6,(a1)
0x00005d6e 		bra	m1ej01
0x00005d7e m1ej07:		cmpi.w	#13824,d0
0x00005d99 		bne	m1ej01
0x00005da7 		move.w	#7,(a1)
0x00005dbd m1ej01:		move.w	ScrCnt,d0
0x00005dd8 		cmpi.w	#AnmStart,d0
0x00005def 		blt	m1pj01
0x00005dfd 		cmpi.w	#AnmStop,d0
0x00005e13 		bhi	m1pj01
0x00005e23 		subq.w	#1,Mp1Wait
0x00005e38 		bne	m1pj01
0x00005e46 		move.w	#Mp1PanmSpd,Mp1Wait
0x00005e66 		lea.l	ColorRam,a1
0x00005e7b 		move.l	PalTop,a0
0x00005e8f 		lea.l	12*32*4(a0),a0
0x00005ea7 		move.w	Mp1NPos,d0
0x00005ebc 		asl.w	d0
0x00005ec8 		lea.l	(a0,d0.w),a0
0x00005ee0 		;*** Set Palet Data ***
0x00005efd 		move.w	00(a0),$0b*2(a1) 	; b
0x00005f1d 		move.w	32(a0),$0c*2(a1)	; c
0x00005f3c 		move.w	64(a0),$0d*2(a1) 	; d
0x00005f5c 		move.w	96(a0),$0e*2(a1)	; e
0x00005f7d 		;*** Next Palet Calc ***
0x00005f9b 		move.w	Mp1NPos,d0
0x00005fb0 		addq.w	#1,d0
0x00005fc0 		cmpi.w	#6,d0
0x00005fd0 		bne	m1pj21
0x00005fde 		moveq.l	#0,d0
0x00005fef m1pj21:		move.w	d0,Mp1NPos
0x0000600b 		move.w	#1,HPalTrans
0x00006022 m1pj01:		rts
0x00006034 Mp1PalAnm:	dc.w	0
0x00006047 Mp1NPos:	dc.w	0
0x00006058 Mp1Wait:	dc.w	1
0x00006071 ;************************************************
0x000060a4 ;*		ＳＥベロシティテーブル		*
0x000060c3 ;************************************************
0x000060f8 	xdef	SEVelTab
0x0000610a SEVelTab	equ	*
0x0000611a 		dc.b	$e0	;  0 ヒット１
0x00006134 		dc.b	$d0	;  1 ヒット２
0x0000614e 		dc.b	$80	;  2 ショット１
0x0000616a 		dc.b	$80	;  3 ショット２
0x00006186 		dc.b	$c0	;  4 爆発１
0x0000619e 		dc.b	$ff	;  5 爆発２
0x000061b6 		dc.b	$ff	;  6 爆発３(生物用)
0x000061d6 		dc.b	$80	;  7 ボム
0x000061ec 		dc.b	$ff	;  8 オプション発生
0x0000620c 		dc.b	$ff	;  9 もーらい
0x00006226 		dc.b	$ff	; 10 オプションショット
0x0000624a 		dc.b	$ff	; 11 パワーアップ
0x00006268 		dc.b	$ff	; 12 アイテム
0x00006282 		dc.b	$ff	; 13 ダメージ
0x0000629c 		dc.b	$ff	; 14 やっちゃえ
0x000062b8 		dc.b	$ff	; 15 きゃん
0x000062d0 		dc.b	$ff	; 16 ポチの声
0x000062ee 		dc.b	$ff	; 16 牛
0x00006302 		dc.b	$ff	; 17 びっくりしたー
0x00006322 		dc.b	$ff	; 18 何、あれ？
0x0000633e 		dc.b	$ff	; 19
0x0000634f 		dc.b	$ff	; 20
0x00006360 		dc.b	$ff	; 21
0x00006371 		dc.w	-1
0x00006382 TraiCnt:	dc.w	0
0x00006396 :		dc.w	EneBom
0x000063a6 		dc.w	0
0x000063b0 		dc.w	0
0x000063ba 		dc.w	PEBom
0x000063c8 		dc.w	ETAPri
0x000063d9 *************************************************
0x0000640c *　		子宝壱号Ｅパターン		*
0x00006428 *************************************************
0x0000645d KodaChr:	dc.w	EneKoTakaraB
0x00006479 		dc.w	272
0x00006485 		dc.w	064
0x00006491 		dc.w	PEKoTakaraAA
0x000064a6 		dc.w	0
0x000064b4 HouLife:	dc.w	0
0x000064c7 		end
```

This is a bit interesting, since it implies the game could be built to run on a system without a disc. When set, it skips music and some sound effect playback
0x000059d3 	if	DiscFlag

Japan Demo - keio6.bin

```
0x0000e080 ***********
0x0000e08d *	子宝参号のホーミング		*
0x0000e0a8 *****************************************
0x0000e0d8 PEMKodaHom	equ	*
0x0000e0ec 		bclr.b	#7,ChrEMT(a5)
0x0000e104 		beq	khmj01
0x0000e114 		;***** fast *****
0x0000e12b 		move.b	#6,ChrRev2H(a5)	
```


Japan Demo - keio7.bin

```
0x000066ec dmbj10:		rts
0x00006702 *****************************************
0x0000672d *	出目金に乗ったたぬき
```

```
0x0000c1cb <ﾎリターン ****
0x0000c1de 		lea.l	WapChrWork(pc),a5
0x0000c1f9 		move.w	#WapChrSiz,d0
0x0000c211 		bsr	SearchChrWork
0x0000c226 		bcs	fotj01
0x0000c236 		;**** 武器の種類の設定 ***
0x0000c256 ;		move.w	WapShotSts(a4),d0
0x0000c273 ;		and.w	#$ff,d0
0x0000c285 		move.w	#PatONShot,d2		* ノーマル弾
0x0000c2ab ;		cmpi.w	#ShotNrm,d0
0x0000c2c2 ;		beq	fotj03
0x0000c2d1 ;		move.w	#PatO3WShot,d2		* ３ＷＡＹ
0x0000c2f7 *		cmpi.w	#Shot3Way,d0
0x0000c30f *		bne	fotj03
0x0000c31e fotj03:
0x0000c32b 		;**** 武器のパワーの設
0x0000e082 ムに変更＆弾のバンク転送 ***
0x0000e0a2 		move.w	d0,WapShotSts(a4)
0x0000e0be 		bsr	WeaponBankTrans
0x0000e0d7 		;*** ＳＥ出力 ***
0x0000e0ee 		move.w	#SEpowup,d0
0x0000e104 		bsr	SEOut
0x0000e111 		move.w	#SEMorai,d0
0x0000e127 		bsr	SEOut
0x0000e136 		;*** 自キャム
```

Japan Demo - title.bin


```
0x00004a58 dm6l01:
0x00004a61 	Scroll	SUp,0,ScrSpr	; 18
0x00004a7c 	Wait	1
0x00004a85 	Scroll	SUp,0,ScrSpr
0x00004a9b 	Wait	1
0x00004aa4 	Scroll	SUp*2,0,ScrSpr
0x00004abc 	Wait	1
0x00004ac5 	Scroll	SUp*2,0,ScrSpr
0x00004add 	Wait	1
0x00004ae6 	Scroll	SUp*3,0,ScrSpr
0x00004afe 	Wait	1
0x00004b07 	Scroll	SUp*2,0,ScrSpr
0x00004b1f 	Wait	1
0x00004b28 	Scroll	SUp*2,0,ScrSpr
0x00004b40 	Wait	1
0x00004b49 	Scroll	SUp,0,ScrSpr
0x00004b5f 	Wait	1
0x00004b68 	Scroll	SUp,0,ScrSpr
0x00004b7e 	Wait	1
0x00004b89 	Scroll	SDown,0,ScrSpr
0x00004ba1 	Wait	1
0x00004baa 	Scroll	SDown,0,ScrSpr
0x00004bc2 	Wait	1
0x00004bcb 	Scroll	SDown*2,0,ScrSpr
0x00004be5 	Wait	1
0x00004bee 	Scroll	SDown*2,0,ScrSpr
0x00004c08 	Wait	1
0x00004c11 	Scroll	SDown*3,0,ScrSpr
0x00004c2b 	Wait	1
0x00004c34 	Scroll	SDown*2,0,ScrSpr
0x00004c4e 	Wait	1
0x00004c57 	Scroll	SDown*2,0,ScrSpr
0x00004c71 	Wait	1
0x00004c7a 	Scroll	SDown,0,ScrSpr
0x00004c92 	Wait	1
0x00004c9b 	Scroll	SDown,0,ScrSpr
0x00004cb3 	Wait	1
0x00004cbe 	Loop	_i,dm6l01
0x00004cd5 	AnmEnd	$0
0x00004ce1 	AnmEnd	$1
0x00004ced 	AnmEnd	$2
0x00004cf9 	AnmEnd	$3
0x00004d0b ;****************************************
0x00004d36 ;*					*
0x00004d40 ;*		ＤＭ０７		*
0x00004d51 ;*					*
0x00004d5b ;****************************************
0x00004d86 ;	爆弾たぬき
0x00004d96 	ClrScr				* Screen CleaLNK
```

```
0x000053bc 	Wait	60*4
0x000053ce 	Jump	SkipAdr
0x000053e5 ;****************************************
0x00005410 ;*					*
0x0000541a ;*		ＰＲ０１		*
0x0000542b ;*					*
0x00005435 ;****************************************
0x00005460 ;	蘭未のプロフィール
0x00005478 Count	set	0
0x00005487 Demo0Scr:
0x00005492 	PckRead	DatDummy1,DatDummy2
0x000054b2 	SkipSet	SkipAdr
0x000054c4 reset:
0x000054cc ;	CDPlay	MusVisOpen		* ＣＤプレイ
0x000054ef 	ClrScr			* Screen Clear
0x00005509 	MemSetC	BgAdr		* a0 = chip
0x00005526 	MemSetC	AnmAdr1		* animetion adress
0x0000554c 	MemSetC	ColAdr		* color adress
0x0000556d 	MemSetC	MapAdrA		* map adress
0x0000558d 	MemSetC	MapAdrB		* map adress
```


So far we've looked at source code from the game itself, but in the USA version, within keio5.bin, we have something pretty unique.

This appears to be the full (kind of) C++ source code for `smapcv`, a tool used during development to apparently convert between the standard SEGA2D format to the game's internal tilemap format.

This is interesting because SEGA2D is more well-known publicly as a tool used in Sega Saturn development, yet here we see the format being used in the development of a Mega CD game.



USA Final - keio5.bin

```
0x00006146 //	smapcv [sega2d file] [keio map file] [opt]
0x00006181 #include	<global.h>
0x00006196 #include	<iostream.h>
0x000061ad #include	<fstream.h>
0x000061c3 #include	<stdio.h>
0x000061d7 #include	<alloc.h>
0x000061eb #include	"sega2d.h"
0x00006200 #include	"cvga.h"
0x00006213 #include	"keiomap.h"
0x00006229 #include	"yamlib.h"
0x00006244 int main(int argc, char **argv)
0x00006268 	SEGA2D_Header		SEGA_Head;
0x00006284 	SEGA2D_MapHeader	SEGA_MapHead;		/* マップデータヘッダー		*/
0x000062c2 	SEGA2D_PageHeader	SEGA_PageHead;		/* ページデータヘッダー		*/
0x00006302 	SEGA2D_CGHeader		SEGA_CGHead;		/* ＣＧデータヘッダー		*/
0x0000633d 	SEGA2D_PaletHeader	SEGA_PalHead;		/* パレットデータヘッダー	*/
0x0000637e 	KM_ScrHeader		KM_sh;
0x00006399 	if (argc < 3) {
0x000063ab 		cout << "smapcv [sega2d file] [keio map file] [option]¥n";
0x000063e9 		cout << "¥t-s1,1¥n";
0x00006401 		return 1;
0x00006416 	ifstream	fSMap(argv[1], ios::in | ios::nocreate | ios::binary);
0x00006458 	if (!fSMap) {
0x00006468 		cout << argv[1] << " file not open.¥n";
0x00006493 		return 1;
0x000064a8 	// ヘッダーの読み込み
0x000064c2 	fSMap.read((char*)&SEGA_Head, sizeof(SEGA_Head));
0x000064f6 	SEGA_Head.sID[15] = 0;
0x0000650f 	cout << "file ID : " << SEGA_Head.sID << endl;
0x00006544 	LongEndianChg(&(SEGA_Head.dwMapDataOfs));			/* Map data			*/
0x00006583 	LongEndianChg(&(SEGA_Head.dwMapDataSize));
0x000065b0 	LongEndianChg(&(SEGA_Head.dwPageDataOfs));			/* Page data		*/
0x000065f0 	LongEndianChg(&(SEGA_Head.dwPageDataSize));
0x0000661e 	LongEndianChg(&(SEGA_Head.dwCGDataOfs));			/* CG data			*/
0x0000665b 	LongEndianChg(&(SEGA_Head.dwCGDataSize));
0x00006687 	LongEndianChg(&(SEGA_Head.dwPaletDataOfs));			/* Palet data		*/
0x000066c9 	LongEndianChg(&(SEGA_Head.dwPaletDataSize));
0x000066f8 	LongEndianChg(&(SEGA_Head.dwAtribDataOfs));			/* Attrib data		*/
0x0000673b 	LongEndianChg(&(SEGA_Head.dwAtribDataSize));
0x00006772 	// マップデータの読み込み
0x00006790 	cout << hex << SEGA_Head.dwMapDataOfs << endl;
0x000067c1 	fSMap.seekg(SEGA_Head.dwMapDataOfs, ios::beg);
0x000067f2 	fSMap.read((char*)&SEGA_MapHead, sizeof(SEGA_MapHead));
0x0000682e 	WordEndianChg(&(SEGA_MapHead.wHPageSize));
0x0000685b 	WordEndianChg(&(SEGA_MapHead.wVPageSize));
0x0000688a 	cout << "X size  : " << SEGA_MapHead.wHPageSize << endl;
0x000068c5 	cout << "Y size  : " << SEGA_MapHead.wVPageSize << endl;
0x00006904 //			SEGA_MapHead.wHPageSize;
0x00006923 //			SEGA_MapHead.wVPageSize;
0x00006946 	fSMap.close();
0x0000695b 	KM_sh.wMapX = SEGA_MapHead.wHPageSize;
0x00006984 	KM_sh.wMapY = SEGA_MapHead.wVPageSize;
0x000069b1 	return	0;
```

# Everything Else

Japan Final - dk3.bin

```
0x00005dde ｯ様で、定義ファイルに記述された削除すべきコード領
0x00005e11 域がOrig 中に含まれていなくても、Orig と New  とが同じファイルになるとは
0x00005e5b 限りません。
0x00005e6d 8.  変更の規則
0x00005e7f  1. 新しいフォントファイルに存在する文字コードが元のフォントファイルにな
0x00005ec9     ければ、そのコードのフォントデータは空 (00h  で埋めたもの)  になりま
0x00005f13     す。
0x00005f1f  2. 元のフォントファイルがもつコード領域テーブルは、昇順に並んでいる必要
0x00005f69     はありません。また、重複する領域があり、同一コードのフォントが複数存
0x00005fb3     在する場合、通常は一番最後に現れたフォントデータのほうを新しいフォン
0x00005ffd     トファイルへ写します。これは $fontx.sys のフォント登録の動作と一致し
0x00006047     ています。-f オプションを指定すると、 一番はじめに現れたフォントデー
0x00006091     タを写します。こちらのほうが少し処理が速くなります。
0x000060cf 9.  注意
0x000060db   WCDAT.SYS(なるい氏(NIFTY-Serve  NBG01416)作のコンソールドライバ)を使っ
0x00006125 ていて、  タイムスタンプが   "93-02-10   00:53"   よりも古いものならば、
0x0000616f JBACK15A.LZH に収められた新しいものに取り替えておいてください。"-"  によ
0x000061b9 ってテーブル定義ファイルの読み込みを標準入力からに指定したときに、誤動作
0x00006203 をしてしまいます。
0x0000621b 10.  開発環境
0x0000622c   実行ファイルはLSI-C86 Ver.3.30 試食版でコンパイルしました。
0x0000626b   動作確認は IBM PS/55note N23SX、IBM DOS J5.02C/V 上で行いました。
0x000062b4 11.  著作権・改変・再配布について
0x000062d9   パブリックドメインである getopt.c 以外のソースコード、ドキュメント、お
0x00006323 よび実行ファイルについては、著作権は黒崎浩行に属します。
0x0000635d   改変・再配布は自由に行ってください(むしろ改変・再配布が妨げられること
0x000063a6 のないよう希望します)。 ただし、改変されたものの配布に際してはソースコー
0x000063f0 ド、ドキュメント、および実行ファイル中に改変者名を明記してください。
0x0000643a 12.  無保証
0x00006449   私はこのプログラムの使用によって生じた損害について一切の責任を負いかね
0x0000649f 13.  バージョン履歴
0x000064b6 0.01 (Feb 14 1993 04:25)
0x000064d0         最初のバージョン
0x000064ea 0.02 (Feb 14 1993 18:37)
0x00006504         Makefileを修正
0x0000651c         元のフォントファイルのヘッダの整合性を確認する
0x00006554         テーブル定義ファイルの行数制限チェック
0x00006584         show2tbl.sed を添付
0x000065a1 0.03 (Feb 15 1993 05:58)
0x000065bb         テーブル定義中、開始コードが終了コードより大きく指定されていたら
0x00006605         中断する
0x00006617         showtbl.pl を添付
0x00006632         和文ドキュメントを添付
0x00006652 0.04 (Feb 15 1993 21:00)
0x0000666c         -O オプション(コード領域テーブル定義の最適化)を追加
0x000066a9         -f オプション(元のフォントファイル中に同一コードのフォントが複数
0x000066f3         存在するときに最初のフォントを新しいフォントファイルへ写す)を追
0x0000673c         加、デフォルトの動作を変更
0x00006760         modfxtbl.c に書いていた英文ドキュメントを削除(和文ドキュメントと
0x000067aa         の一致を図るのが面倒くさくなったので)
0x000067d9 0.05 (Feb 16 1993 18:34)
0x000067f3         -a・-d オプション (定義ファイルを追加用・削除用とみなす) を追加
0x0000683c 0.06 (Feb 27 1993 23:59)
0x00006856         Borland C++ Ver.3.0 でもコンパイルできるようにした。
0x00006894         (showtbl.pl) djgpp版のようにintが16ビットでないjperlを使うとコー
0x000068de         ド領域テーブルが正常に表示されないのを修正。
0x00006914         上記に応じて C ソースでも文字コードを代入する変数をunsigned int
0x0000695d         型から unsigned short int 型に変えた。
0x0000698d 1.00 (Apr 29 1993)
0x000069a1         新規フォントファイルと同名ファイルがある場合は無条件に中断するこ
0x000069eb         とにした。
0x00006a03 14.  謝辞
0x00006a10   $fontx.sys の著作者である lepton 氏に感謝します。
```


The pattern that emerges is that the data seems to begin around [] and end near 0x7000. 