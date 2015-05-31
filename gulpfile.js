var gulp = require('gulp'),
  browserify = require('browserify'),
  watchify = require('watchify'),
  path = require('path'),
  babelify = require('babelify'),
  rimraf = require('rimraf'),
  source = require('vinyl-source-stream'),
  _ = require('lodash'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload,
  usemin = require('gulp-usemin'),
  uglify = require('gulp-uglify'),
  minifyHtml = require('gulp-minify-html'),
  minifyCss = require('gulp-minify-css'),
  rev = require('gulp-rev'),
  concat = require('gulp-concat'),
  less = require('gulp-less'),
  imagemin = require('gulp-imagemin'),
  proxy = require('proxy-middleware'),
  copy = require('gulp-copy'),
  templateCache = require('gulp-angular-templatecache'),
  htmlify = require('gulp-angular-htmlify'),
  ngAnnotate = require('gulp-ng-annotate'),
  replace = require('gulp-replace'),
  url = require('url'),
  fs = require('fs'),
  urlRewrite = function (rootDir, indexFile) {
    indexFile = indexFile || "index.html";
    return function (req, res, next) {
      var path = url.parse(req.url).pathname;
      return fs.readFile('./' + rootDir + path, function (err, buf) {
        if (!err) {
          return next();
        }
        if (path.substring(path.length - 4) == 'html') { // if html file not found
          res.writeHead(404);
          return res.end('Not found');
        }
        return fs.readFile('./' + rootDir + '/' + indexFile, function (error, buffer) {
          var resp;
          if (error) {
            return next(error);
          }
          resp = {
            headers: {
              'Content-Type': 'text/html',
              'Content-Length': buffer.length
            },
            body: buffer
          };
          res.writeHead(200, resp.headers);
          return res.end(resp.body);
        });
      });
    };
  };

var config = {
  entryFile: './app/init.js',
  outputDir: './build/',
  assetsDir: './assets/',
  outputFile: 'app.js',
  views: './views/**/*.html'
};

// clean the output directory
gulp.task('clean', function (cb) {
  rimraf(config.outputDir, cb);
});

var bundler;
function getBundler() {
  if (!bundler) {
    bundler = watchify(browserify(config.entryFile, _.extend({debug: true}, watchify.args)));
  }
  return bundler;
};

function bundle() {
  return getBundler()
    .transform(babelify)
    .bundle()
    .on('error', function (err) {
      console.log('Error: ' + err.message);
    })
    .pipe(source(config.outputFile))
    .pipe(ngAnnotate())
    .pipe(gulp.dest(config.outputDir))
    .pipe(reload({stream: true}));
}

gulp.task('build-persistent', [], function () {
  return bundle();
});

gulp.task('replace-base', ['usemin'], function(){
  gulp.src(config.outputDir + 'index.html')
    .pipe(replace('<base href="/', '<base href="/cabinet/'))
    .pipe(gulp.dest(config.outputDir));
});

gulp.task('build', ['build-persistent', 'usemin', 'copyAssets', 'optimizeImages', 'replace-base'], function () {
  process.exit(0);
});

gulp.task('optimizeImages', ['clean'], function () {
  return gulp.src(config.assetsDir + '**/*.{gif,jpg,png}')
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(gulp.dest(config.outputDir + 'assets'));
});

gulp.task('copyAssets', ['copyCkeditor'], function () {
  return gulp.src(config.assetsDir + '**/*.{eot,ttf,woff,woff2,svg}')
    .pipe(copy(config.outputDir));
});
gulp.task('copyCkeditor', ['clean'], function () {
  return gulp.src(config.assetsDir + 'ckeditor/**')
    .pipe(copy(config.outputDir));
});

gulp.task('less', function () {
  return gulp.src(config.assetsDir + 'less/style.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest(config.assetsDir + 'styles'));
});

gulp.task('compileTemplates', ['compileAppTemplates'], function () {
  return gulp.src([config.views])
    .pipe(htmlify())
    .pipe(templateCache({
      root: 'views/',
      standalone: true,
      module: 'views'
    }))
    .pipe(gulp.dest(config.outputDir));
});

gulp.task('compileAppTemplates', ['build-persistent'], function () {
  return gulp.src(['./app/**/*.html'])
    .pipe(htmlify())
    .pipe(templateCache({
      root: 'app/',
      filename: 'templates-app.js',
      standalone: false,
      module: 'views'
    }))
    .pipe(gulp.dest(config.outputDir));
});

gulp.task('concat', ['build-persistent', 'compileTemplates'], function() {
  return gulp.src([config.outputDir + 'templates.js', config.outputDir + 'templates-app.js', config.outputDir + 'app.js'])
    .pipe(concat('app.js'))
    .pipe(gulp.dest(config.outputDir));
});

gulp.task('usemin', ['build-persistent', 'concat'], function () {
  return gulp.src('./*.html')
    .pipe(usemin({
      css: [minifyCss(), 'concat'],
      css1: [minifyCss(), 'concat'],
      html: [minifyHtml({empty: true})],
      js: [uglify()],
      js1: [uglify(), rev()]
    }))
    .pipe(gulp.dest('build/'));
});


gulp.task('watch', ['build-persistent'], function () {
  gulp.watch(config.assetsDir + 'less/**/*.less', ['less']);

  var proxyOptions = url.parse('http://localhost:8080/api');
  proxyOptions.route = '/api';

  var proxyOptions2 = url.parse('http://localhost:8080/socket.io');
  proxyOptions2.route = '/socket.io';

  browserSync({
    server: {
      baseDir: './',
      middleware: [
        proxy(proxyOptions),
        proxy(proxyOptions2),
        urlRewrite('.')
      ]
    }
  });

  getBundler().on('update', function () {
    gulp.start('build-persistent')
  });
});

// WEB SERVER
gulp.task('serve', function () {
  browserSync({
    server: {
      baseDir: './'
    }
  });
});