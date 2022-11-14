---
title: CODEOWNERS-driven organization
spoiler: Noodling on how to organize a big codebase using CODEOWNERS
date: '2022-11-14'
---

I spotted a conversation in the ol' work Slack that had me thinking. Sarah, <abbr title="Also Known As">A.K.A.</abbr> [@cheshire137](https://twitter.com/cheshire137), one of GitHub's most prolific and skilled engineers, said the following about a change to a file (paraphrasing to not have to redact too much):

> I saw you were changing `user_settings_controller.rb` - if y'all were able to split that file up, we could move `#update_profile` to a different file so my team would get pinged for reviews when it gets modified...

Sarah was suggesting splitting up a big file that had mixed ownership, where multiple teams cared about different parts of the file. Not for clarity or readability (those too), but for clearer _ownership_. This is something that small projects with only a few people don't really have to deal with, but in a [Majestic Monolith](https://m.signalvnoise.com/the-majestic-monolith/)[^1] thoughtful code ownership is vital to productivity and a high (but safe) rate of change.

## The "problem" with monoliths

The core of GitHub.com is a Ruby on Rails monolith. This isn't a secret, nor is GitHub the only one. Shopify, Stripe and many more major tech companies operate around huge monoliths that hundreds (if not thousands) of developers contribute to every day. There are microservices as needed, but the monolith is the glue that holds it all together.

How can code review work in a monolith with thousands of files? How can you ensure that the right people are reviewing the right code?

This is where [GitHub's concept of CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) comes in. You can mark specific files, directories or globs as "owned" by a particular user or team. When a pull request is opened that touches those files, the CODEOWNERS are automatically requested for review.

## CODEOWNERS-driven code organization

The idea of CODEOWNERS-driven code organization is to lean on CODEOWNERS to organize your code into logical chunks. It means forcing the code to be split up into feature areas, even when that means splitting up a file into "sub-files" where you otherwise wouldn't bother.

In a Rails world, that can mean splitting up your controllers into smaller files, so that they can be owned by different teams. This applies to anything - models, views, helpers. It's not specific to Rails either, it's just a general programming concept to think about.

I'm a big proponent of smaller files where possible for readability, and this is a great way to enforce that.

## A practical example

Let's take this controller, for an imaginary User Settings set of routes. This is a simple controller, but with two very different actions:

```ruby
class UserSettingsController > ApplicationController
  def update_profile
    # ...
  end

  def update_password
    # ...
  end
end
```

```
# CODEOWNERS
app/controllers/user_settings_controller.rb @profile-team @security-team
```

This is fake code, but at least within GitHub the `update_profile` and `update_password` actions would be owned by different teams. `update_profile` is owned by the `@profile-team` team, and `update_password` is owned by the `@security-team` team.

Neither team should get pings for the others' changes, and we definitely wouldn't want this code to only be owned by `@profile-team`, as `@security-team` really needs to know about any changes to the password flow.

So, how do we split this up? Following this concept of "CODEOWNERS-driven organization", that'd mean two different controllers:

```ruby
# app/controllers/user_settings/profile_controller.rb
class UserSettings::ProfileController > ApplicationController
  def update
    # ...
  end
end

# app/controllers/user_settings/password_controller.rb
class UserSettings::PasswordController > ApplicationController
  def update
    # ...
  end
end
```

Maybe that's a bit more code, and you need to think about reusing bits between those controllers, but it means you can do this in your CODEOWNERS file:

```
# CODEOWNERS
app/controllers/user_settings/profile_controller.rb @profile-team
app/controllers/user_settings/password_controller.rb @security-team
```

## The benefits

There are a few benefits to this approach:

- **Automatic Pull Request reviews**: You don't have to figure out who to request a review from when you're making a change to a file you're not familiar with. The CODEOWNERS will be automatically requested for review.
- **The reverse is true too**: Your team will be requested for a review whenever someone makes a change to a file that you own. This is a great way to keep up to date with what's going on in a busy codebase.
- **Smaller, more readable files**: As a side-benefit of thinking this way, your files will be smaller and easier to parse. Diffs will be smaller as a result - smaller diffs will be easier to review!

It's not a big change to make, it's just a minor shift in thinking and deciding when to split up a chunky file.

[^1]: I don't agree with a lot of DHH's opinions, but I do think this is a great article. You don't need to have a small team to see the value of a monolith, and more importantly [you should treat your employees as people](https://www.theverge.com/2021/5/3/22418208/basecamp-all-hands-meeting-employee-resignations-buyouts-implosion).