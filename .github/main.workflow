workflow "Test my code" {
  on = "push"
  resolves = ["npm test"]
}

action "npm ci" {
  uses = "docker://node"
  args = "npm ci"
}

action "npm test" {
  uses = "actions/npm@master"
  args = "test"
  needs = ["npm ci"]
}
