workflow "Test my code" {
  on = "push"
  resolves = ["npm install-ci-test"]
}

action "npm install-ci-test" {
  uses = "docker://node"
  runs = "npm"
  args = "install-ci-test"
}
