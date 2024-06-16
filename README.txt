Change Password currently under development

We can separate out the files model, to store the files only once, where we can refer it from any other model.


The request for searching a subject file
"/subject_catalog/subject/searchfiles/:subject_name" in "search.route.js"

conflicts with the request for displaying a file
"/subject_catalog/subject/:subject_name/:file_id" in "views.route.js"

This is temporarily resolved by keeping the order of "search.route.js" above "views.route.js" in the "server.js" file while linking the routes