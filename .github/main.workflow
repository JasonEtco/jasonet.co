workflow "Test my code" {
  on = "push"
  resolves = ["npm test"]
}

action "npm test" {
  uses = "docker://node"
  args = "npm ci && npm test"
}
