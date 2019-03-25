workflow "Test my code" {
  on = "push"
  resolves = ["npm test"]
}

action "npm ci" {
  uses = "docker://node:lts-alpine"
  runs = "npm"
  args = "ci"
}

action "npm test" {
  uses = "docker://node:lts-alpine"
  runs = "npm"
  args = "test"
  needs = ["npm ci"]
}
