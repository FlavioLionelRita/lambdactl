module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt)
	grunt.initConfig({
		exec: {
			tsc: { cmd: 'npx tsc ' },
			lint: { cmd: 'npx eslint src ' },
			test: { cmd: 'npx jest --config jest-config.json' },
			doc: { cmd: 'npx typedoc --plugin typedoc-plugin-markdown --out doc/source src/lib/doc.index.ts' },
			getOriginalBranch: {
				cmd: 'git branch | sed -n -e \'s/^\\* \\(.*\\)/\\1/p\'',
				callback: function (error, stdout, stderr) {
					if (error) {
						grunt.log.error(stderr)
					} else {
						grunt.config.set('originalBranch', stdout.trim())
					}
				}
			},
			standardVersion: {
				cmd: 'standard-version'
			},
			push: {
				cmd: 'git add . && git commit -m "chore(release): <%= version %>" && git push'
			},
			createReleaseBranch: {
				cmd: 'git checkout -b release/<%= version %> && git push --set-upstream origin release/<%= version %>'
			},
			mergeToMain: {
				cmd: 'git checkout main && git merge release/<%= version %> -m "chore(release): release <%= version %>" && git push'
			},
			mergeToOriginalBranch: {
				cmd: 'git checkout <%= originalBranch %> && git merge release/<%= version %> -m "chore(release): release <%= version %>" && git push'
			},
			removeLocalReleaseBranch: {
				cmd: 'git branch -D release/<%= version %>'
			}
		},
		clean: {
			build: ['build'],
			dist: ['dist']
		},
		copy: {
			sintaxis: { expand: true, cwd: './src/lib/domain', src: './sintaxis.d.ts', dest: 'build/domain' },
			lib: { expand: true, cwd: 'build/lib', src: '**', dest: 'dist/' },
			readme: { expand: true, src: './README.md', dest: 'dist/' },
			changeLog: { expand: true, src: './CHANGELOG.md', dest: 'dist/' },
			license: { expand: true, src: './LICENSE', dest: 'dist/' },
			jest: { expand: true, src: './jest-config.json', dest: 'dist/' }
		}
	})

	grunt.registerTask('get-version', 'get version from package.json', function () {
		const version = grunt.file.readJSON('./package.json').version
		grunt.config.set('version', version)
	})

	grunt.registerTask('create-package', 'create package.json for dist', function () {
		const fs = require('fs')
		const data = require('./package.json')
		delete data.devDependencies
		delete data.private
		data.scripts = {
			test: data.scripts.test
		}
		data.main = 'index.js'
		data.bin = { lambdaorm: 'index.js' }
		data.types = 'index.d.ts'
		fs.writeFileSync('dist/package.json', JSON.stringify(data, null, 2), 'utf8')
	})

	grunt.registerTask('exec-release', ['exec:standardVersion', 'copy:changeLog', 'create-package', 'get-version', 'exec:push', 'exec:createReleaseBranch', 'exec:mergeToMain', 'exec:mergeToOriginalBranch', 'exec:removeLocalReleaseBranch'])
	grunt.registerTask('run-release-if-applicable', 'run release if applicable', function () {
		const originalBranch = grunt.config.get('originalBranch')
		if (originalBranch === 'develop' || originalBranch.startsWith('hotfix')) {
			grunt.task.run('exec-release')
		} else {
			grunt.log.writeln('Current branch ' + originalBranch + ', cannot release from branch different from develop or hotfix.')
		}
	})
	grunt.registerTask('lint', ['exec:lint'])
	grunt.registerTask('build', ['lint', 'clean:build', 'exec:tsc', 'copy:sintaxis'])
	grunt.registerTask('test', ['build', 'exec:test'])
	grunt.registerTask('doc', ['exec:doc'])
	grunt.registerTask('dist', ['test', 'clean:dist', 'copy:lib', 'copy:jest', 'copy:readme', 'copy:license', 'create-package'])
	grunt.registerTask('release', ['dist', 'doc', 'exec:getOriginalBranch', 'run-release-if-applicable'])
	grunt.registerTask('default', [])
}
