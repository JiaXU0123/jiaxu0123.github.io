const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'experience', 'publications', 'awards'];


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    const scrollSpy = mainNav && new bootstrap.ScrollSpy(document.body, {
        target: '#mainNav',
        offset: 74,
    });

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    const sections = section_names.map(name => {
        return fetch(content_dir + name + '.md')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Could not load ${name}.md (HTTP ${response.status})`);
                }
                return response.text();
            })
            .then(markdown => {
                const html = marked.parse(markdown);
                document.getElementById(name + '-md').innerHTML = html;
            });
    });

    Promise.allSettled(sections).then(async results => {
        for (const result of results) {
            if (result.status === 'rejected') {
                console.error(result.reason);
            }
        }

        scrollSpy?.refresh();
        if (window.MathJax?.startup?.promise) {
            await window.MathJax.startup.promise;
            await window.MathJax.typesetPromise();
        }
    }).catch(error => console.error(error));

}); 
