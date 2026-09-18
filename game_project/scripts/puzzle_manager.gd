extends Node3D

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
