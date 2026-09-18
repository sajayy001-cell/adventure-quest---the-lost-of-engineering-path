extends Node

signal key_collected(key_name: String)
signal resource_collected(resource_name: String, amount: int)
signal level_unlocked(level_id: int)
signal boss_health_changed(current_hp: int, max_hp: int)
signal game_won

var keys = {
	"sun": false,   # Keystone from Trial 1
	"moon": false,  # Keystone from Trial 2
	"star": false   # Keystone from Trial 3
}

var resources = {
	"aether_core": 0,       # Resource 1: Powers Aether Pulse
	"resonant_crystal": 0,  # Resource 2: Powers Crystal Beam
	"titan_catalyst": 0     # Resource 3: Powers Titan Overdrive Stun
}

var current_level: int = 1
var player_health: int = 100

func add_key(key_type: String) -> void:
	if keys.has(key_type):
		keys[key_type] = true
		key_collected.emit(key_type)
		print("[GameManager] Keystone unlocked: ", key_type.capitalize())

func add_resource(res_type: String, count: int = 1) -> void:
	if resources.has(res_type):
		resources[res_type] += count
		resource_collected.emit(res_type, resources[res_type])
		print("[GameManager] Resource collected: ", res_type, " Total: ", resources[res_type])

func complete_puzzle_level(level_id: int) -> void:
	match level_id:
		1:
			add_key("sun")
			add_resource("aether_core", 1)
			level_unlocked.emit(2)
		2:
			add_key("moon")
			add_resource("resonant_crystal", 1)
			level_unlocked.emit(3)
		3:
			add_key("star")
			add_resource("titan_catalyst", 1)
			level_unlocked.emit(4) # Boss Arena

func can_access_level(level_id: int) -> bool:
	match level_id:
		1: return true
		2: return keys["sun"]
		3: return keys["moon"]
		4: return keys["star"]
	return false
