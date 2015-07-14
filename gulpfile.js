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
  angularTranslate = require('gulp-angular-translate'),
  templateCache = require('gulp-angular-templatecache'),
  htmlify = require('gulp-angular-htmlify'),
  ngAnnotate = require('gulp-ng-annotate'),
  replace = require('gulp-replace'),
  extractTranslate = require('gulp-angular-translate-extractor'),
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
  localeDir: './locale/',
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

gulp.task('build', ['build-persistent', 'usemin', 'copyAssets', 'copyLocale', 'optimizeImages', 'replace-base', 'less'], function () {
  process.exit(0);
});

gulp.task('optimizeImages', ['clean'], function () {
  return gulp.src(config.assetsDir + '**/*.{gif,jpg,png}')
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(gulp.dest(config.outputDir + 'assets'));
});

gulp.task('copyAssets', ['copyCkeditor', 'copyFavicon'], function () {
  return gulp.src(config.assetsDir + '**/*.{eot,ttf,woff,woff2,svg}')
    .pipe(copy(config.outputDir));
});
gulp.task('copyLocale', ['copyCkeditor', 'copyFavicon'], function () {
  return gulp.src(config.localeDir + '*.json')
    .pipe(copy(config.outputDir));
});
gulp.task('copyCkeditor', ['clean'], function () {
  return gulp.src(config.assetsDir + 'ckeditor/**')
    .pipe(copy(config.outputDir));
});
gulp.task('copyFavicon', ['clean'], function () {
  return gulp.src('favicon.ico')
    .pipe(copy(config.outputDir));
});

gulp.task('less', function () {
  return gulp.src(config.assetsDir + 'less/theme.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest(config.assetsDir + 'css'));
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


gulp.task('parseTranslate', function() {
  var i18ndest = 'locale';
  return gulp.src([
    'index.html',
    'views/**/*.html',
    'app/**/*.js'
  ])
    .pipe(extractTranslate({
      defaultLang: 'en-US',         // default language
      lang: ['en-US', 'ru-RU'],   // array of languages
      dest: i18ndest,             // destination
      safeMode: false,            // do not delete old translations, true - contrariwise
      stringifyOptions: true,     // force json to be sorted, false - contrariwise
    }))
    .pipe(gulp.dest(i18ndest));
});
gulp.task('translate', ['parseTranslate'], function() {
  return gulp.src('locale/*.json')
    .pipe(angularTranslate())
    .pipe(gulp.dest('build/'));
});

gulp.task('watch', ['build-persistent'], function () {
  gulp.watch(config.assetsDir + 'less/**/*.less', ['less']);

  gulp.watch(['index.html','views/**/*.html','app/**/*.js'], ['translate']);

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

  var proxyOptions = url.parse('http://localhost:8080/api');
  proxyOptions.route = '/api';

  var proxyOptions2 = url.parse('ws://localhost:8080/socket.io');
  proxyOptions2.route = '/socket.io';

  browserSync({
    server: {
      baseDir: './build',
      middleware: [
        proxy(proxyOptions),
        proxy(proxyOptions2),
        urlRewrite('./build')
      ]
    },
    notify: false
  });
});