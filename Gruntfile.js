module.exports = function (grunt) {
  const envify = require('envify/custom')
  const sass = require('node-sass');

  grunt.initConfig({
    pkg: grunt.file.readJSON('./package.json'),

    // --------------------------------------------------------------------------------
    // VAR PATH
    //
    paths: {
      src: {
        root: 'src', // before ./src
        assets: '<%= paths.src.root %>/assets',
        fonts: '<%= paths.src.assets %>/fonts',
        images: '<%= paths.src.assets %>/img',
        pdf: '<%= paths.src.assets %>/pdf',
        videos: '<%= paths.src.assets %>/video',
        scss: '<%= paths.src.assets %>/scss',
        js: '<%= paths.src.assets %>/js',
        templates: '<%= paths.src.root %>/templates',
        layouts: '<%= paths.src.templates %>/layouts',
        partials: '<%= paths.src.templates %>/partials',
        pages: '<%= paths.src.templates %>/pages',
        data: '<%= paths.src.templates %>/data'
      },
      dest: {
        root: 'build', // before ./build 
        assets: '<%= paths.dest.root %>/assets',
        fonts: '<%= paths.dest.assets %>/fonts',
        images: '<%= paths.dest.assets %>/img',
        pdf: '<%= paths.dest.assets %>/pdf',
        videos: '<%= paths.dest.assets %>/video',
        css: '<%= paths.dest.assets %>/css',
        js: '<%= paths.dest.assets %>/js'
      }
    },

    // --------------------------------------------------------------------------------
    // SASS
    //
    sass: {
      dist: {
        options: {
          implementation: sass,
          outputStyle: 'compressed',
          precision: 6,
          loadPath: ['<%= paths.src.scss %>/**/'],
          sourceMap: '<%= paths.dest.css %>/screen.css.map',
          sourceComments: false
        },
        files: [
          {
            expand: true,
            cwd: '<%= paths.src.scss %>',
            src: ['*.scss'],
            dest: '<%= paths.dest.css %>',
            ext: '.css'
          }
        ]
      }
    },

    // --------------------------------------------------------------------------------
    // CSS MIN
    //
    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: '<%= paths.dest.css %>',
          src: ['**/*.css', '!*.min.css'],
          dest: '<%= paths.dest.css %>',
          ext: '.min.css'
        }]
      }
    },

    // --------------------------------------------------------------------------------
    // POSTCSS
    //
    postcss: {
      options: {
        map: true, // inline sourcemaps
        processors: [
          require('autoprefixer')
        ]
      },
      dist: {
        src: '<%= paths.dest.css %>/screen.css'
      }

    },


    // --------------------------------------------------------------------------------
    // UGLIFY
    //
    uglify: {
      dist: {
        files: {
          '<%= paths.dest.js %>/scripts.js': ['<%= paths.src.js %>/*.js', '<%= paths.src.js %>/components/*.js', '!<%= paths.src.js %>/es6/**/*.js']
        },
        options: {
          sourceMap: true,
          sourceMapName: '<%= paths.dest.js %>/scripts.map',
          sourceMapIncludeSources: true
        }
      }
    },

    // --------------------------------------------------------------------------------
    // CONCAT
    //
    concat: {
      options: {
        separator: '\n'
      },
      dist: {
        src: ['<%= paths.src.js %>/lib/**/*.js'],
        dest: '<%= paths.dest.js %>/lib/utils.js'
      }
    },

    // --------------------------------------------------------------------------------
    // JSTTOJS
    //
    jsttojs: {
      root: '<%= paths.src.js %>/jst',
      output: '<%= paths.src.js %>/templates.js',
      ext: 'jst',
      removebreak: true,
      amd: false,
      requirements: ['handlebars'],
      name: 'TPL'
    },

    // --------------------------------------------------------------------------------
    // BROWSERIFY
    //
    browserify: {
      
      dev: {
        files: {
          //'<%= paths.dest.js %>/app/app.js': ['<%= paths.src.root %>/app/**/app.js'], only for SPA use
          '<%= paths.dest.js %>/app.js': ['<%= paths.src.js %>/es6/**/*.js']
        },
        options: {
            browserifyOptions: { debug: true },
            transform: ['vueify',['babelify']],
            sourceMaps: true
        }
      },
      prod: {
        files: {
          //'<%= paths.dest.js %>/app/app.js': ['<%= paths.src.root %>/app/**/app.js'], only for SPA use
          '<%= paths.dest.js %>/app.js': ['<%= paths.src.js %>/es6/**/*.js']
        },
       
        options: {
          browserifyOptions: { debug: false },
          transform: ['vueify',['babelify']],
          // Function to deviate from grunt-browserify's default order
          configure: b => b
            .transform(
              // Required in order to process node_modules files
              { global: true },
              envify({ NODE_ENV: 'production' })
            )
            .bundle()
        }
      }
    },

    // --------------------------------------------------------------------------------
    // ASSEMBLE.IO (Handlebars)
    //
    assemble: {
      options: {
        assets: '<%= paths.src.assets %>',
        layoutdir: '<%= paths.src.layouts %>',
        partials: [
          '<%= paths.src.layouts %>/**/*.hbs',
          '<%= paths.src.pages %>/**/*.hbs',
          '<%= paths.src.partials %>/**/*.hbs'
        ],
        data: ['<%= paths.src.data %>/*.{json,yml}'],
        flatten: true,
        ext: '.html',
        engine: 'handlebars'
      },
      dev: {
        options: {
          layout: 'master-layout.hbs',
          debug: true
        },
        src: ['<%= paths.src.pages %>/*.hbs'],
        dest: '<%= paths.dest.root %>/'
      },
      build: {
        options: {
          layout: 'master-layout.hbs',
          debug: false
        },
        src: ['<%= paths.src.pages %>/*.hbs'],
        dest: '<%= paths.dest.root %>/'
      }
    },

    // --------------------------------------------------------------------------------
    // PRETTIFY HTML
    //
    prettify: {
      options: {
        indent: 2,
        indent_char: ' ',
        wrap_line_length: 78,
        brace_style: 'expand',
        unformatted: ['a', 'sub', 'sup', 'b', 'i', 'u']
      },
      // Prettify a directory of files 
      all: {
        expand: true,
        cwd: '<%= paths.dest.root %>',
        ext: '.html',
        src: ['*.html'],
        dest: '<%= paths.dest.root %>'
      }
    },

    // --------------------------------------------------------------------------------
    // SVG2FONT
    //
    webfont: {
      icons: {
        src: '<%= paths.src.images %>/icons/*.svg',
        dest: '<%= paths.src.fonts %>/',
        destCss: '<%= paths.src.scss %>/ui/',
        options: {
          fontFilename: 'icons',
          stylesheets: ['scss'],
          syntax: 'bem',
          templateOptions: {
            baseClass: 'icon',
            classPrefix: 'icon--'
          },
          htmlDemo: true,
          embed: false,
          types: 'eot,woff,ttf,svg',
          order: 'eot,woff,ttf,svg',
          engine: 'fontforge',
          relativeFontPath: '../fonts',
          fontFamilyName: 'Custom Icons',
          skip: require('os').platform() === 'win32'
        }
      }
    },

    // --------------------------------------------------------------------------------
    // IMAGEMIN
    //
    imagemin: {
      prod: {
        files: [{
          expand: true,
          cwd: '<%= paths.src.images %>',
          src: ['**/*.{png,jpg}'],
          dest: '<%= paths.dist.images %>'
        }]
      }
    },

    // --------------------------------------------------------------------------------
    // SPRITESMITH
    //
    sprite: {
      all: {
        src: ['<%= paths.src.images %>/icons/**/*.png'],
        dest: '<%= paths.dest.images %>/shared/skin.png',
        destCss: '<%= paths.src.scss %>/base/_skin.scss',
        imgPath: '../img/shared/skin.png',
        cssVarMap: function (sprite) {
          if (sprite.name.substr(-3) == "-on") {
            sprite.name = sprite.name.substr(0, sprite.name.length - 3)
            sprite.name = sprite.name + ":hover";
          }
        },
        padding: 2,
      }
    },

    // --------------------------------------------------------------------------------
    // COPY
    //
    copy: {
      dist: {
        expand: true,
        cwd: '<%= paths.src.root %>',
        src: ['api/**/*', 'ajax/**/*', 'scorm-courses/**/*', 'assets/img/**/*', 'assets/video/**/*', 'assets/pdf/**/*', 'assets/fonts/**/*', 'assets/js/jst/*', 'assets/js/ie8/*', 'assets/js/scorm/*', 'favicon.ico'],
        dest: '<%= paths.dest.root %>/'
      }
    },

    // --------------------------------------------------------------------------------
    // DELETE SYNC
    //
    delete_sync: {
      dist: {
        cwd: '<%= paths.dest.root %>',
        src: ['api/**/*', 'ajax/**/*', 'assets/img/**/*', 'assets/video/**/*', 'assets/pdf/**/*', 'assets/fonts/**/*', 'assets/js/jst/*', 'assets/js/ie8/*', 'favicon.ico'],
        syncWith: 'src'
      }
    },

    // --------------------------------------------------------------------------------
    // CLEAN
    //
    clean: {
      build: {
        src: ["build"]
      },
      sasscache: {
        src: [".sass-cache"]
      }
    },

    // --------------------------------------------------------------------------------
    // WIREDEP
    //(for bower component)
    //Install a Bower component: bower install jquery --save
    //Call the Grunt task: grunt wiredep
    wiredep: {
      task: {
        src: [
          '<%= paths.dest.root %>/**/*.html',
          '<%= paths.src.scss %>/**/*.scss',
          '<%= paths.src.templates %>/**/*.hbs'
        ]
      }
    },

    // --------------------------------------------------------------------------------
    // WATCH
    //
    watch: {
      options: {
        livereload: false
      },
      css: {
        files: ['<%= paths.src.scss %>/**/*.scss'],
        tasks: ['sass', 'postcss']
      },
      js: {
        files: ['<%= paths.src.js %>/*.js', '<%= paths.src.js %>/components/**/*.js'],
        tasks: ['uglify']
      },
      es6js: {
        files: ['<%= paths.src.js %>/es6/**/*.js'],
        tasks: ['browserify:dev']
      },
      jsttojs: {
        files: ['<%= paths.src.js %>/jst/*.jst'],
        tasks: ['jsttojs']
      },
      libjs: {
        files: ['<%= paths.src.js %>/lib/**/*.js'],
        tasks: ['concat'],
      },
      delete_sync: {
        files: ['<%= paths.src.root %>/*.html', '<%= paths.src.assets %>/**', '<%= paths.src.root %>/api/**', '<%= paths.src.root %>/ajax/**'],
        tasks: ['delete_sync']
      },
      copyfiles: {
        files: ['<%= paths.src.root %>/favicon.ico', '<%= paths.src.root %>/api/**', '<%= paths.src.root %>/ajax/**', '<%= paths.src.assets %>/**', '<%= paths.src.assets %>/**/*'],
        tasks: ['newer:copy']
      },
      templates: {
        files: ['<%= paths.src.templates %>/**/**/*'],
        tasks: ['assemble:dev']
      },
      vue: {
        files: ['<%= paths.src.root %>/app/**/**/*.js', '<%= paths.src.root %>/app/**/**/*.vue', '<%= paths.src.root %>/app/**/*.scss'],
        tasks: ['browserify:dev']
      }
    },

    // --------------------------------------------------------------------------------
    // BROWSER SYNC
    //
    browserSync: {
      dev: {
        bsFiles: {
          src: [
            '<%= paths.dest.root %>/**/*'
          ]
        },
        options: {
          watchTask: true,
          server: {
            baseDir: "<%= paths.dest.root %>",
            directory: true
          },

          https: false,
          browser: ["google chrome"]
        }
      }
    },

    // --------------------------------------------------------------------------------
    // ENVIFY (for Vue app production)
    //
    env: {
      prod: {
        options: {
          env: {
            NODE_ENV: 'production'
          }
        }
      }
    }


  });

  // caricamento dei plugin
  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  // registerTask
  grunt.registerTask('build', ['clean:build', 'copy', 'webfont', 'sass', 'postcss', 'jsttojs', 'uglify', 'concat', 'assemble:build', 'env', 'browserify:prod']);
  grunt.registerTask('build-min', ['build', 'prettify', 'cssmin', 'imagemin']);
  grunt.registerTask('dev', ['build', 'browserSync', 'watch']);

  //Extra
  grunt.registerTask('webfont_gen', ['webfont']);
  grunt.registerTask('sprite_gen', ['sprite']);

};
