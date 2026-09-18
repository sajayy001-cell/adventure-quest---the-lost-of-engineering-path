extends CanvasLayer

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
