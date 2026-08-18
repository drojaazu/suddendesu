--  Geo Storm - Add Player 3/4 Inputs to 2 Player Games
--  This is specifically intended for Geo Storm / Gun Force II which has a disabled
--  4 player mode, but should be usable on any hardware to add additional inputs
--
--  This script does NOT patch the game! Use the cheats for that. This script
--  only hooks in the extra player inputs.
--
--  How to use:
--    mame geostorm -autoboot_script geostorm_4player.lua -autoboot_delay 0

-- ---------------------------------------------------------------- configuration

-- MAME key tokens. Run MAME's "Input (general)" menu or see src/emu/inpttype.h for names.
local KEYS = {
  p3 = {
    up    = "KEYCODE_I",     down  = "KEYCODE_K",
    left  = "KEYCODE_J",     right = "KEYCODE_L",
    b1    = "KEYCODE_N",     b2    = "KEYCODE_M",
    start = "KEYCODE_7",     -- START3 pin (bit 4); this is the coin input under Separate slots
    coin  = "KEYCODE_9",     -- COIN3 pin (bit 5) - the stock game never reads it
  },
  p4 = {
    up    = "KEYCODE_8_PAD", down  = "KEYCODE_2_PAD",
    left  = "KEYCODE_4_PAD", right = "KEYCODE_6_PAD",
    b1    = "KEYCODE_ENTER_PAD", b2 = "KEYCODE_DEL_PAD",
    start = "KEYCODE_8",
    coin  = "KEYCODE_0",     -- COIN4 pin (bit 13), likewise unread
  },
}

-- P3_P4 bit assignments, active low, per iremipt.h IREM_INPUT_PLAYER_3/4.
-- Player 4 is the same set shifted up by 8.
local BITS = {
  right = 0x0001, left = 0x0002, down = 0x0004, up = 0x0008,
  start = 0x0010, coin = 0x0020, b2 = 0x0040, b1 = 0x0080,
}

local VERBOSE = true    -- print the key map once at startup

-- --------------------------------------------------------------------- driver

local M    = manager.machine
local io_  = M.devices[":maincpu"].spaces["io"]
local inp  = M.input

local codes = nil
local injected = 0xFFFF   -- active low, so all-ones means nothing pressed

local function resolve()
  local t = {}
  for who, set in pairs(KEYS) do
    t[who] = {}
    for name, token in pairs(set) do
      local ok, code = pcall(function() return inp:code_from_token(token) end)
      if ok then t[who][name] = code
      else print("could not resolve key token " .. token) end
    end
  end
  return t
end

local function pressed(code)
  if code == nil then return false end
  local ok, down = pcall(function() return inp:code_pressed(code) end)
  return ok and down
end

tap = io_:install_read_tap(0x06, 0x07, "geostorm_p34", function(offset, data, mask)
  return data & injected
end)

local announced = false
sub = emu.add_machine_frame_notifier(function()
  if codes == nil then codes = resolve() end

  local m = 0xFFFF
  for who, shift in pairs({ p3 = 0, p4 = 8 }) do
    for name, bit in pairs(BITS) do
      if pressed(codes[who][name]) then m = m & ~(bit << shift) end
    end
  end
  injected = m

  if VERBOSE and not announced then
    announced = true
    print("P3: " .. KEYS.p3.up .. "/" .. KEYS.p3.down .. "/" .. KEYS.p3.left .. "/"
          .. KEYS.p3.right .. "  b1 " .. KEYS.p3.b1 .. "  b2 " .. KEYS.p3.b2
          .. "  start " .. KEYS.p3.start .. "  coin " .. KEYS.p3.coin)
    print("P4: " .. KEYS.p4.up .. "/" .. KEYS.p4.down .. "/" .. KEYS.p4.left .. "/"
          .. KEYS.p4.right .. "  b1 " .. KEYS.p4.b1 .. "  b2 " .. KEYS.p4.b2
          .. "  start " .. KEYS.p4.start .. "  coin " .. KEYS.p4.coin)
  end
end)
