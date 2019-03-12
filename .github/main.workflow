workflow "Test my code" {
  on = "push"
  resolves = ["npm test"]
}

action "npm ci" {
  uses = "docker://timbru31/node-alpine-git"
  args = "npm ci"
}

action "npm test" {
  uses = "docker://node:10-alpine"
  args = "test"
  needs = ["npm ci"]
}
