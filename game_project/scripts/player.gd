extends CharacterBody3D

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
