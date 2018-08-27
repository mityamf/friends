"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");

gulp.task("style", function() {
  gulp.src("scss/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 4 versions"
      ]})
    ]))
    .pipe(gulp.dest("dist/css"));
});

gulp.task("serve", ["style"], function() {
  gulp.watch("scss/**/*.{scss,sass}", ["style"]);
});
