workflow "Test my code" {
  on = "push"
  resolves = ["npm test"]
}

action "npm test" {
  uses = "actions/npm@master"
  args = "ci && npm test"
}
