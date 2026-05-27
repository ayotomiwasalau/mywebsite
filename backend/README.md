python3 -m venv .blogenv

chmod +x .blogenv/bin/activate

source .blogenv/bin/activate

## Admin auth

Public read routes such as `GET /api/v1/blogs`, `GET /api/v1/projects`, `POST /api/v1/messages`, and `POST /api/v1/subscribers` stay open. Admin routes require a bearer token from `POST /api/v1/auth/login`.

Set these local env values in `backend/.env`:

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me-local-only
JWT_SECRET=change-me-to-a-long-random-secret
JWT_EXPIRES_MINUTES=60
```

For deployed environments, prefer `ADMIN_PASSWORD_HASH` instead of `ADMIN_PASSWORD`.


* blog & project service

Blogs
POST /blogs
- create a new blog

PUT /blogs/{slug}
- update blog metadata + markdown

PUT /blogs/{slug}/replace-markdown
- upload/replace existing markdown file

DELETE /blogs/{slug}
- delete blog

POST /blogs/{slug}/publish
- publish draft blog

POST /blogs/{slug}/unpublish
- move published blog back to draft

Projects

POST /projects
- create a new project

PUT /projects/{slug}
- update project metadata + markdown

PUT /projects/{slug}/replace-markdown
- upload/replace existing markdown file

DELETE /projects/{slug}
- delete project

POST /projects/{slug}/publish
- publish draft project

POST /projects/{slug}/unpublish
- move published project back to draft


Work
Use a unified read endpoint for feed/discovery:
GET /work
GET /work/{type}/{slug}
Example:
GET /work?type=project
GET /work?type=blog
GET /work?tag=kafka


#todo
- setup db - done
- create db ui?
- create one blog api that write to db - done
- craete one blog api that reads to db - done
- create db class for read & write - done
- define db schema - done


blog
{
    id: "",
    slug: "",
    title: "",
    header_img_url: "",
    header_img_alt: "",
    description: "",
    tags: [],
    href: "",
    filepath_md: "",
    created_on: "",
    updated_on: "",
    shares: 0,
    project_url: ""
}

project
{
    id: "",
    slug: "",
    title: "",
    header_img_url: "",
    header_img_alt: "",
    description: "",
    tags: [],
    href: "",
    filepath_md: "",
    created_on: "",
    updated_on: "",
    shares: 0,
    blog_url: ""
}




{
  "id": "0",
  "title": "Building a Micro-Event Data Lake: Spark, Airflow, and Redshift on AWS",
  "category": "Sport",
  "description": "A data store containing sourced and processed data on microevents that happened in a football game such length of pass, position of shot taken, success of tackle etc...",
  "imageSrc": "/blogimages/clubdwh.png",
  "projUrl": "https://github.com/ayotomiwasalau/club_football_data_lake",
  "timeAgo": "2024-07-03T12:00:00Z",
  "blogUrl":"https://www.kaggle.com/datasets/ayotomiwasalau/club-football-event-data"
}
{
  "id": "351a6ad2-d1d3-4612-9d61-553d3d8e4115",
  "title": "Distributed Computing",
  "filepath": "/blogmarkdowns/distributed_compute.md",
  "imageSrc": "/blogimages/distributed_compute.webp",
  "likes": 1,
  "tags": [],
  "timeAgo": "2025-02-12T12:59:35.317Z"
}



#work?type=project

# add tool to pin specific feature

db.users.find()                      # all docs (pretty: append .pretty() in older style; in mongosh use .toArray() or configure)
db.users.find({ role: "dev" })
db.users.findOne({ name: "Ada" })
db.users.countDocuments({ role: "dev" })

db.users.insertOne({ name: "Ada", role: "dev" })
db.users.insertMany([{ a: 1 }, { a: 2 }])

show dbs                             # list databases
use mydb                             # switch DB (creates it on first write)
db                                   # current database name
show collections                     # collections in current DB

db.users.deleteOne({ name: "Ada" })
db.users.deleteMany({ role: "dev" })

cd deployments/terraform

terraform apply \
  -target=aws_ecr_repository.backend \
  -target=aws_ecr_lifecycle_policy.backend