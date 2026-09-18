extends CharacterBody3D

@export var max_health: int = 100
var current_health: int = 100

var is_defeated: bool = false
var is_stunned: bool = false
var attack_timer: Timer

func _ready() -> void:
	current_health = max_health
	attack_timer = Timer.new()
	add_child(attack_timer)
	attack_timer.wait_time = 5.0
	attack_timer.timeout.connect(_on_attack_timer)
	attack_timer.start()
	print("The Chrono-Colossus awakens in the Boss Arena! Use collected resources to attack.")

func take_damage_from_resource(resource_type: String) -> void:
	if is_defeated:
		return
	
	var dmg: int = 0
	match resource_type:
		"aether_core":
			dmg = 25
			print(">> Aether Pulse blasted Chrono-Colossus for 25 damage!")
		"resonant_crystal":
			dmg = 35
			print(">> Resonant Crystal Beam pierced Chrono-Colossus for 35 damage!")
		"titan_catalyst":
			dmg = 50
			stun_boss(3.0)
			print(">> Titan Overdrive overloaded Chrono-Colossus for 50 damage and stunned it!")

	current_health = max(0, current_health - dmg)
	GameManager.boss_health_changed.emit(current_health, max_health)

	if current_health <= 0:
		defeat_boss()

func stun_boss(duration: float) -> void:
	is_stunned = true
	attack_timer.stop()
	await get_tree().create_timer(duration).timeout
	if not is_defeated:
		is_stunned = false
		attack_timer.start(5.0)

func _on_attack_timer() -> void:
	if is_defeated or is_stunned:
		return
	print(">> Chrono-Colossus unleashes Temporal Shockwave! Jump with Space to dodge.")

func defeat_boss() -> void:
	is_defeated = true
	attack_timer.stop()
	print(">> VICTORY! Chrono-Colossus has been vanquished. Sovereign of Engineering achieved!")
	GameManager.game_won.emit()
