# Require any additional compass plugins here.

# Toggle this between :development and :production when deploying the CSS to the
# live server. Development mode will retain comments and spacing from the
# original Sass source and adds line numbering comments for easier debugging.
# environment = :production
environment = :development

# In development, we can turn on the FireSass-compatible debug_info.
# firesass = false
firesass = true


# Set this to the root of your project when deployed:
http_path = "/"
css_dir = "../css"
sass_dir = "../sass"
images_dir = "../img"
javascripts_dir = "../js"


##
## You probably don't need to edit anything below this.
##

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed
output_style = (environment == :development) ? :expanded : :compressed

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false

# Pass options to sass. For development, we turn on the FireSass-compatible
# debug_info if the firesass config variable above is true.
sass_options = (environment == :development && firesass == true) ? {:debug_info => true} : {}
