softboy life is good o
<!-- create an image module, endpoint and the corresponding filedisk functionallity, it should have an endpoint to store uploaded image file in the required file location, delete image and update/replace existing image. the file should be stored /images/blog/{slug}/{image_name}.  -->
rearrange the blog imagescfile according to follow this path
/images/blog/{slug}/{image_name}
/images/project/{slug}/{image_name}
update the database header_img_url data to reference this image paths
update the image reference in the markdown file to reference the new image path

arrange the markdowns such that they stored following the new path
/markdowns/project
/markdowns/blog
update the database filepath_md data to reference this paths


