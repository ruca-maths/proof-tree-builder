-- theories/group.lean
-- Rigorous Base Library for Group Theory Proof Builder

class CustomGroup (G : Type) where
  mul : G → G → G
  one : G
  inv : G → G
  mul_assoc : ∀ a b c : G, mul (mul a b) c = mul a (mul b c)
  one_mul : ∀ a : G, mul one a = a
  mul_left_inv : ∀ a : G, mul (inv a) a = one

-- Notations
infixl:70 " * " => CustomGroup.mul
postfix:max "⁻¹" => CustomGroup.inv
notation "1" => CustomGroup.one

-- Expose axioms
theorem mul_assoc_thm {G : Type} [CustomGroup G] (a b c : G) : (a * b) * c = a * (b * c) := CustomGroup.mul_assoc a b c
theorem one_mul_thm {G : Type} [CustomGroup G] (a : G) : 1 * a = a := CustomGroup.one_mul a
theorem mul_left_inv_thm {G : Type} [CustomGroup G] (a : G) : a⁻¹ * a = 1 := CustomGroup.mul_left_inv a

-- Previously proven lemmas will be added here or in the generated scripts by the backend as they are unlocked.
