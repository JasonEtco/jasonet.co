workflow "Deploy to GitHub Pages" {
  on = "push"
  resolves = [ "Deploy" ]
}

action "Default Branch" {
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "Install dependencies" {
  needs = [ "Default Branch" ]
  uses = "actions/npm@master"
  args = "install"
}

action "Build" {
  needs = [ "Install dependencies" ]
  uses = "actions/npm@master"
  args = "run build -- --prefix-paths"
}

action "Deploy" {
  needs = [ "Build" ]
  uses = "JasonEtco/push-to-gh-pages@master"
  secrets = ["GITHUB_TOKEN"]
  args = "public"
}
