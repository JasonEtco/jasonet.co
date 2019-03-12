workflow "Test my code" {
  on = "push"
  resolves = ["npm cit"]
}

action "npm cit" {
  uses = "docker://node"
  args = "npm cit"
}
