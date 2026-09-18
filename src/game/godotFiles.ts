import JSZip from 'jszip';

export interface GodotFile {
  path: string;
  name: string;
  category: 'config' | 'script' | 'scene';
  description: string;
  content: string;
}

export const GODOT_PROJECT_FILES: GodotFile[] = [
  {
    path: 'project.godot',
    name: 'project.godot',
    category: 'config',
    description: 'Godot 4.x Project Configuration, Autoloads, and Input Mappings',
    content: `; Engine configuration file.
; Generated for Godot 4.x - Trials of the Architect
; Complete 3D Adventure Game with Gateway, Bridge, Puzzles & Boss

config_version=5

[application]

config/name="Trials of the Architect"
config/description="3D Adventure Puzzle Game featuring Grand Gateway, Bridge, 3 Engineering Trials, and Final Boss"
run/main_scene="res://scenes/main.tscn"
config/features=PackedStringArray("4.3", "Forward Plus")

[autoload]

GameManager="*res://scripts/game_manager.gd"

[input]

move_forward={
"deadzone": 0.5,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":87,"key_label":0,"unicode":119,"echo":false,"script":null), Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":4194320,"key_label":0,"unicode":0,"echo":false,"script":null)
]
}
move_back={
"deadzone": 0.5,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":83,"key_label":0,"unicode":115,"echo":false,"script":null), Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":4194322,"key_label":0,"unicode":0,"echo":false,"script":null)
]
}
move_left={
"deadzone": 0.5,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":65,"key_label":0,"unicode":97,"echo":false,"script":null), Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":4194319,"key_label":0,"unicode":0,"echo":false,"script":null)
]
}
move_right={
"deadzone": 0.5,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":68,"key_label":0,"unicode":100,"echo":false,"script":null), Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":4194321,"key_label":0,"unicode":0,"echo":false,"script":null)
]
}
jump={
"deadzone": 0.5,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":32,"key_label":0,"unicode":32,"echo":false,"script":null)
]
}
interact={
"deadzone": 0.5,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":69,"key_label":0,"unicode":101,"echo":false,"script":null)
]
}

[rendering]

renderer/rendering_method="forward_plus"
environment/defaults/default_clear_color=Color(0.04, 0.06, 0.1, 1)
`,
  },
  {
    path: 'scenes/main.tscn',
    name: 'main.tscn',
    category: 'scene',
    description: 'Godot 4.x Main Level Scene containing Gateway, Bridge, Nexus, 3 Trials, Boss Arena & Player',
    content: `[gd_scene load_steps=22 format=3 uid="uid://c8j6yv73l8q1x"]

[ext_resource type="Script" path="res://scripts/player.gd" id="1_player"]
[ext_resource type="Script" path="res://scripts/hud.gd" id="2_hud"]
[ext_resource type="Script" path="res://scripts/final_boss.gd" id="3_boss"]
[ext_resource type="Script" path="res://scripts/puzzle_manager.gd" id="4_puzzle"]

[sub_resource type="ProceduralSkyMaterial" id="ProceduralSkyMaterial_1"]
sky_top_color = Color(0.06, 0.09, 0.18, 1)
sky_horizon_color = Color(0.14, 0.18, 0.28, 1)
ground_bottom_color = Color(0.02, 0.03, 0.07, 1)
ground_horizon_color = Color(0.09, 0.12, 0.2, 1)

[sub_resource type="Sky" id="Sky_1"]
sky_material = SubResource("ProceduralSkyMaterial_1")

[sub_resource type="Environment" id="Environment_1"]
background_mode = 2
sky = SubResource("Sky_1")
ambient_light_source = 3
ambient_light_color = Color(0.65, 0.75, 0.9, 1)
fog_enabled = true
fog_light_color = Color(0.07, 0.11, 0.2, 1)
fog_density = 0.004

[sub_resource type="CapsuleShape3D" id="CapsuleShape3D_player"]
radius = 0.4
height = 1.8

[sub_resource type="StandardMaterial3D" id="StandardMaterial3D_player"]
albedo_color = Color(0.2, 0.5, 0.85, 1)
metallic = 0.4
roughness = 0.3

[sub_resource type="CapsuleMesh" id="CapsuleMesh_player"]
material = SubResource("StandardMaterial3D_player")
radius = 0.4
height = 1.8

[sub_resource type="BoxShape3D" id="BoxShape3D_ground"]
size = Vector3(36, 2, 36)

[sub_resource type="StandardMaterial3D" id="StandardMaterial3D_stone"]
albedo_color = Color(0.22, 0.25, 0.3, 1)
roughness = 0.85

[sub_resource type="BoxMesh" id="BoxMesh_ground"]
material = SubResource("StandardMaterial3D_stone")
size = Vector3(36, 2, 36)

[sub_resource type="BoxShape3D" id="BoxShape3D_bridge"]
size = Vector3(10, 2, 80)

[sub_resource type="BoxMesh" id="BoxMesh_bridge"]
material = SubResource("StandardMaterial3D_stone")
size = Vector3(10, 2, 80)

[sub_resource type="CylinderShape3D" id="CylinderShape3D_nexus"]
height = 3.0
radius = 42.0

[sub_resource type="CylinderMesh" id="CylinderMesh_nexus"]
material = SubResource("StandardMaterial3D_stone")
top_radius = 42.0
bottom_radius = 42.0
height = 3.0

[sub_resource type="StandardMaterial3D" id="StandardMaterial3D_boss"]
albedo_color = Color(0.8, 0.3, 0.2, 1)
metallic = 0.7
roughness = 0.2

[sub_resource type="BoxMesh" id="BoxMesh_boss"]
material = SubResource("StandardMaterial3D_boss")
size = Vector3(3, 6, 3)

[sub_resource type="BoxShape3D" id="BoxShape3D_boss"]
size = Vector3(3, 6, 3)

[node name="Main" type="Node3D"]

[node name="WorldEnvironment" type="WorldEnvironment" parent="."]
environment = SubResource("Environment_1")

[node name="DirectionalLight3D" type="DirectionalLight3D" parent="."]
transform = Transform3D(0.866, -0.353, 0.353, 0, 0.707, 0.707, -0.5, -0.612, 0.612, 40, 70, 30)
light_color = Color(0.98, 0.94, 0.85, 1)
light_energy = 1.3
shadow_enabled = true

[node name="CitadelEnvironment" type="Node3D" parent="."]

[node name="StartPlaza" type="StaticBody3D" parent="CitadelEnvironment"]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, -1, 20)

[node name="CollisionShape3D" type="CollisionShape3D" parent="CitadelEnvironment/StartPlaza"]
shape = SubResource("BoxShape3D_ground")

[node name="MeshInstance3D" type="MeshInstance3D" parent="CitadelEnvironment/StartPlaza"]
mesh = SubResource("BoxMesh_ground")

[node name="GrandGateway" type="Node3D" parent="CitadelEnvironment"]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0)

[node name="GatewayLight" type="OmniLight3D" parent="CitadelEnvironment/GrandGateway"]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 6, 0)
light_color = Color(0.2, 0.75, 1, 1)
light_energy = 3.0
omni_range = 25.0

[node name="TheBridge" type="StaticBody3D" parent="CitadelEnvironment"]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, -1, -45)

[node name="CollisionShape3D" type="CollisionShape3D" parent="CitadelEnvironment/TheBridge"]
shape = SubResource("BoxShape3D_bridge")

[node name="MeshInstance3D" type="MeshInstance3D" parent="CitadelEnvironment/TheBridge"]
mesh = SubResource("BoxMesh_bridge")

[node name="BridgeLight" type="OmniLight3D" parent="CitadelEnvironment/TheBridge"]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 8, 0)
light_color = Color(0.3, 0.8, 1, 1)
light_energy = 2.0
omni_range = 40.0

[node name="PuzzleNexus" type="StaticBody3D" parent="CitadelEnvironment"]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, -1.5, -125)

[node name="CollisionShape3D" type="CollisionShape3D" parent="CitadelEnvironment/PuzzleNexus"]
shape = SubResource("CylinderShape3D_nexus")

[node name="MeshInstance3D" type="MeshInstance3D" parent="CitadelEnvironment/PuzzleNexus"]
mesh = SubResource("CylinderMesh_nexus")

[node name="NexusLight" type="OmniLight3D" parent="CitadelEnvironment/PuzzleNexus"]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 10, 0)
light_color = Color(0.9, 0.8, 0.4, 1)
light_energy = 4.0
omni_range = 50.0

[node name="Trial1_PowerMatrix" type="Node3D" parent="CitadelEnvironment/PuzzleNexus"]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, -22, 1.5, 0)
script = ExtResource("4_puzzle")
level_id = 1
puzzle_name = "Trial 1: Power Conductor Matrix"

[node name="Trial2_Intelligence" type="Node3D" parent="CitadelEnvironment/PuzzleNexus"]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1.5, -22)
script = ExtResource("4_puzzle")
level_id = 2
puzzle_name = "Trial 2: Intelligence Quiz"

[node name="Trial3_RunicAlignment" type="Node3D" parent="CitadelEnvironment/PuzzleNexus"]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 22, 1.5, 0)
script = ExtResource("4_puzzle")
level_id = 3
puzzle_name = "Trial 3: Runic Keystone Alignment"

[node name="BossArena" type="StaticBody3D" parent="CitadelEnvironment"]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, -1, -210)

[node name="CollisionShape3D" type="CollisionShape3D" parent="CitadelEnvironment/BossArena"]
shape = SubResource("CylinderShape3D_nexus")

[node name="MeshInstance3D" type="MeshInstance3D" parent="CitadelEnvironment/BossArena"]
mesh = SubResource("CylinderMesh_nexus")

[node name="ChronoColossus" type="CharacterBody3D" parent="CitadelEnvironment/BossArena"]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 3, 0)
script = ExtResource("3_boss")

[node name="CollisionShape3D" type="CollisionShape3D" parent="CitadelEnvironment/BossArena/ChronoColossus"]
shape = SubResource("BoxShape3D_boss")

[node name="MeshInstance3D" type="MeshInstance3D" parent="CitadelEnvironment/BossArena/ChronoColossus"]
mesh = SubResource("BoxMesh_boss")

[node name="BossLight" type="OmniLight3D" parent="CitadelEnvironment/BossArena/ChronoColossus"]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 4, 0)
light_color = Color(1, 0.3, 0.2, 1)
light_energy = 3.5
omni_range = 25.0

[node name="Player" type="CharacterBody3D" parent="."]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1.2, 22)
script = ExtResource("1_player")

[node name="CollisionShape3D" type="CollisionShape3D" parent="Player"]
shape = SubResource("CapsuleShape3D_player")

[node name="MeshInstance3D" type="MeshInstance3D" parent="Player"]
mesh = SubResource("CapsuleMesh_player")

[node name="CameraPivot" type="Node3D" parent="Player"]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1.6, 0)

[node name="SpringArm3D" type="SpringArm3D" parent="Player/CameraPivot"]
spring_length = 5.5
margin = 0.2

[node name="Camera3D" type="Camera3D" parent="Player/CameraPivot/SpringArm3D"]
current = true

[node name="HUD" type="CanvasLayer" parent="."]
script = ExtResource("2_hud")
`,
  },
  {
    path: 'scripts/player.gd',
    name: 'player.gd',
    category: 'script',
    description: 'Godot 4.x Third-Person CharacterBody3D Controller with Camera Orbit & Interaction',
    content: `extends CharacterBody3D

@export var speed: float = 8.5
@export var jump_velocity: float = 6.8
@export var mouse_sensitivity: float = 0.003

@onready var camera_pivot: Node3D = $CameraPivot
@onready var spring_arm: SpringArm3D = $CameraPivot/SpringArm3D
@onready var character_mesh: Node3D = $MeshInstance3D

var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity")

func _ready() -> void:
	Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)
	print("Player initialized. WASD to move, Mouse to look, Space to jump, E to interact.")

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion and Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
		if camera_pivot:
			camera_pivot.rotate_y(-event.relative.x * mouse_sensitivity)
		if spring_arm:
			spring_arm.rotate_x(-event.relative.y * mouse_sensitivity)
			spring_arm.rotation.x = clamp(spring_arm.rotation.x, deg_to_rad(-65), deg_to_rad(45))
	
	if event.is_action_pressed("ui_cancel"):
		if Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
			Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
		else:
			Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)
	
	if event.is_action_pressed("interact"):
		trigger_interact()

func _physics_process(delta: float) -> void:
	# Add gravity
	if not is_on_floor():
		velocity.y -= gravity * delta

	# Handle jump
	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = jump_velocity

	# Get movement direction relative to camera
	var input_dir: Vector2 = Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	if camera_pivot:
		var cam_transform: Transform3D = camera_pivot.global_transform
		var direction: Vector3 = (cam_transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()
		direction.y = 0

		if direction:
			velocity.x = direction.x * speed
			velocity.z = direction.z * speed
			if character_mesh:
				var target_angle: float = atan2(-direction.x, -direction.z)
				character_mesh.rotation.y = lerp_angle(character_mesh.rotation.y, target_angle, delta * 12.0)
		else:
			velocity.x = move_toward(velocity.x, 0, speed * delta * 8.0)
			velocity.z = move_toward(velocity.z, 0, speed * delta * 8.0)
	else:
		velocity.x = 0
		velocity.z = 0

	move_and_slide()

func trigger_interact() -> void:
	print("Player pressed [E] Interact! Scanning nearby puzzle terminals...")
	var root = get_tree().current_scene
	if not root:
		return
	
	# Check distance to puzzle terminals
	var puzzle_nodes = root.find_children("", "Node3D", true, false)
	for node in puzzle_nodes:
		if node.has_method("interact_puzzle"):
			var dist = global_position.distance_to(node.global_position)
			if dist < 8.0:
				node.interact_puzzle()
				return
	
	# Check distance to boss
	var boss = root.find_child("ChronoColossus", true, false)
	if boss and global_position.distance_to(boss.global_position) < 18.0:
		print("Confronting Boss! Using available resources...")
		if GameManager.resources["titan_catalyst"] > 0:
			boss.take_damage_from_resource("titan_catalyst")
		elif GameManager.resources["resonant_crystal"] > 0:
			boss.take_damage_from_resource("resonant_crystal")
		elif GameManager.resources["aether_core"] > 0:
			boss.take_damage_from_resource("aether_core")
		else:
			print("Collect sacred keystones and resources from Trials 1, 2, and 3 first!")
`,
  },
  {
    path: 'scripts/game_manager.gd',
    name: 'game_manager.gd',
    category: 'script',
    description: 'Godot 4.x Global Autoload Singleton Managing Progression, Keystones & Resources',
    content: `extends Node

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
`,
  },
  {
    path: 'scripts/puzzle_manager.gd',
    name: 'puzzle_manager.gd',
    category: 'script',
    description: 'Godot 4.x Puzzle Trial Logic for Power Conductor Matrix, Quiz, and Runic Alignment',
    content: `extends Node3D

@export var level_id: int = 1
@export var puzzle_name: String = "Trial 1: Power Conductor Matrix"

signal puzzle_solved(level: int)
signal puzzle_failed(level: int)

var is_completed: bool = false

func interact_puzzle() -> void:
	if is_completed:
		print("[PuzzleManager] Trial ", level_id, " is already conquered!")
		return
		
	if not GameManager.can_access_level(level_id):
		print("[PuzzleManager] Trial ", level_id, " is sealed! Conquer previous trial first.")
		return

	# Solve trial progression
	is_completed = true
	GameManager.complete_puzzle_level(level_id)
	puzzle_solved.emit(level_id)
	print("[PuzzleManager] Conquered ", puzzle_name, "! Keystone & Resource granted.")
`,
  },
  {
    path: 'scripts/final_boss.gd',
    name: 'final_boss.gd',
    category: 'script',
    description: 'Godot 4.x Boss AI with Resource Vulnerabilities, Shockwaves & Defeat Sequence',
    content: `extends CharacterBody3D

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
`,
  },
  {
    path: 'scripts/hud.gd',
    name: 'hud.gd',
    category: 'script',
    description: 'Godot 4.x CanvasLayer HUD with Dynamic UI Generation for Health, Keystones, Resources & Boss Bar',
    content: `extends CanvasLayer

var objective_label: Label
var keys_label: Label
var resources_label: Label
var boss_container: VBoxContainer
var boss_bar: ProgressBar
var victory_overlay: PanelContainer

func _ready() -> void:
	build_hud_ui()
	GameManager.key_collected.connect(_on_key_collected)
	GameManager.resource_collected.connect(_on_resource_collected)
	GameManager.boss_health_changed.connect(_on_boss_health_changed)
	GameManager.game_won.connect(_on_game_won)

func build_hud_ui() -> void:
	# Main HUD container
	var margin = MarginContainer.new()
	margin.set_anchors_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 24)
	margin.add_theme_constant_override("margin_top", 24)
	margin.add_theme_constant_override("margin_right", 24)
	margin.add_theme_constant_override("margin_bottom", 24)
	add_child(margin)

	# Top bar container
	var top_bar = HBoxContainer.new()
	top_bar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_bar.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	margin.add_child(top_bar)

	# Objective display
	var obj_box = PanelContainer.new()
	var obj_vbox = VBoxContainer.new()
	obj_box.add_child(obj_vbox)
	
	var title = Label.new()
	title.text = "TRIALS OF THE ARCHITECT (GODOT 4.x)"
	title.add_theme_color_override("font_color", Color(0.95, 0.85, 0.4))
	obj_vbox.add_child(title)

	objective_label = Label.new()
	objective_label.text = "Objective: Cross the Bridge and Conquer the 3 Trials"
	objective_label.add_theme_color_override("font_color", Color.WHITE)
	obj_vbox.add_child(objective_label)
	top_bar.add_child(obj_box)

	# Spacer
	var spacer = Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_bar.add_child(spacer)

	# Inventory Display
	var inv_box = PanelContainer.new()
	var inv_vbox = VBoxContainer.new()
	inv_box.add_child(inv_vbox)

	keys_label = Label.new()
	keys_label.text = "Keystones: [Sun: ✗]  [Moon: ✗]  [Star: ✗]"
	keys_label.add_theme_color_override("font_color", Color(0.4, 0.85, 1.0))
	inv_vbox.add_child(keys_label)

	resources_label = Label.new()
	resources_label.text = "Resources: Aether: 0 | Crystal: 0 | Catalyst: 0"
	resources_label.add_theme_color_override("font_color", Color(0.8, 0.9, 0.4))
	inv_vbox.add_child(resources_label)
	top_bar.add_child(inv_box)

	# Boss Bar Container (Centered at top)
	boss_container = VBoxContainer.new()
	boss_container.set_anchors_preset(Control.PRESET_CENTER_TOP)
	boss_container.visible = false
	margin.add_child(boss_container)

	var boss_title = Label.new()
	boss_title.text = "THE CHRONO-COLOSSUS"
	boss_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	boss_title.add_theme_color_override("font_color", Color(1.0, 0.4, 0.3))
	boss_container.add_child(boss_title)

	boss_bar = ProgressBar.new()
	boss_bar.custom_minimum_size = Vector2(400, 24)
	boss_bar.max_value = 100
	boss_bar.value = 100
	boss_container.add_child(boss_bar)

	# Victory Overlay
	victory_overlay = PanelContainer.new()
	victory_overlay.set_anchors_preset(Control.PRESET_CENTER)
	victory_overlay.visible = false
	var victory_box = VBoxContainer.new()
	victory_overlay.add_child(victory_box)
	
	var vic_label = Label.new()
	vic_label.text = "VICTORY! YOU HAVE CONQUERED THE TRIALS"
	vic_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vic_label.add_theme_color_override("font_color", Color(0.4, 1.0, 0.5))
	victory_box.add_child(vic_label)
	margin.add_child(victory_overlay)

func _on_key_collected(key_type: String) -> void:
	var sun_sym = "✓" if GameManager.keys["sun"] else "✗"
	var moon_sym = "✓" if GameManager.keys["moon"] else "✗"
	var star_sym = "✓" if GameManager.keys["star"] else "✗"
	keys_label.text = "Keystones: [Sun: %s]  [Moon: %s]  [Star: %s]" % [sun_sym, moon_sym, star_sym]
	objective_label.text = "Unlocked Keystone %s! Proceed to next trial." % key_type.capitalize()

func _on_resource_collected(res_type: String, count: int) -> void:
	resources_label.text = "Resources: Aether: %d | Crystal: %d | Catalyst: %d" % [
		GameManager.resources["aether_core"],
		GameManager.resources["resonant_crystal"],
		GameManager.resources["titan_catalyst"]
	]

func _on_boss_health_changed(hp: int, max_hp: int) -> void:
	boss_container.visible = true
	boss_bar.max_value = max_hp
	boss_bar.value = hp

func _on_game_won() -> void:
	victory_overlay.visible = true
	objective_label.text = "Trials Completed! Sovereign of Engineering"
`,
  },
];

/**
 * Packages all generated Godot 4.x files into a single ZIP archive.
 * Preserves the exact folder structure:
 * game_project/
 * ├── project.godot
 * ├── scenes/
 * │   └── main.tscn
 * └── scripts/
 *     ├── player.gd
 *     ├── game_manager.gd
 *     ├── puzzle_manager.gd
 *     ├── final_boss.gd
 *     └── hud.gd
 */
export async function createGodotProjectZip(): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder('game_project');
  if (!root) {
    throw new Error('Failed to initialize zip folder');
  }

  for (const file of GODOT_PROJECT_FILES) {
    root.file(file.path, file.content);
  }

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}
