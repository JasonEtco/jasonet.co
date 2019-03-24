workflow "Test my code" {
  on = "push"
  resolves = ["npm test"]
}

action "npm ci" {
  uses = "docker://timbru31/node-alpine-git"
  runs = "npm"
  args = "ci"
}

action "npm test" {
  uses = "docker://node:10-alpine"
  runs = "npm"
  args = "test"
  needs = ["npm ci"]
}
