module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            my_target: {
                files: [
                    {expand: true, cwd: 'src/js', src: '*.js', dest: 'dist'},
                    // {expand: true, src: '**/*.js', dest: 'dest/js'},
                ],
            },
        },

        copy: {
            main: {
                files: [
                    {expand: true, cwd: 'src/example', src: ['example.html'], dest: 'demo'},
                    {expand: true, cwd: 'src', src: ['fonts/**/*'], dest: 'demo'},
                    {expand: true, cwd: 'dist', src: '*.js', dest: 'demo'},
                ],
            },
        },

        compassMultiple: {
            // options : {
            //     // if you need, you can set options.
            //     environment: 'production',
            //     outputStyle: 'compressed',
            //     relativeAssets: true,
            //     time: true
            // },

            // multiple option provides you to compile multi sassDir.
            all: {
                options: {
                    multiple: [
                        {
                            environment: 'production',
                            outputStyle: 'compressed',
                            sassDir: 'src/scss',
                            cssDir: 'dist'
                        },
                        {
                            environment: 'development',
                            outputStyle: 'nested',
                            sassDir: 'src/scss',
                            cssDir: 'dev'
                        },
                        {
                            environment: 'production',
                            outputStyle: 'compressed',
                            sassDir: 'src/scss',
                            cssDir: 'demo'
                        }
                    ],
                },
            },
        },

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-compass-multiple');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['uglify', 'compassMultiple', 'copy']);
};
