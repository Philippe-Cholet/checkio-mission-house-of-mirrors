requirejs(['ext_editor_io', 'jquery_190', 'raphael_210'],
    function (extIO, $) {
        function houseOfMirrorsAnimation(tgt_node, data) {

            if (!data || !data.ext) {
                return
            }

            const [grid, monsters, counts] = data.in
            const output = data.out

            /*----------------------------------------------*
             *
             * attr
             *
             *----------------------------------------------*/
            const attr = {
                grid: {
                    'stroke-width': '1px',
                },
                mirror: {
                    'stroke-width': '5px',
                },
                initial: {
                    'fill': 'white',
                    'font-size': '16px',
                },
                number: {
                    'color': 'black',
                    'font-size': '16px',
                    'font-weight': 'bold',
                },
                vampire: {
                    'fill': '#FABA00',
                    'stroke-width': '0px',
                    'font-size': '10px',
                    'letter-spacing': 'normal',
                },
                zombie: {
                    'fill': '#294270',
                    'stroke-width': '0px',
                    'font-size': '10px',
                    'letter-spacing': 'normal',
                },
                ghost: {
                    'fill': '#61B0E5',
                    'stroke-linejoin': 'round',
                    'stroke': '#61B0E5',
                    'font-size': '10px',
                    'stroke-width': '0px',
                    'letter-spacing': 'normal',
                },
            }

            /*----------------------------------------------*
            *
            * values
            *
            *----------------------------------------------*/
            const height = grid.length
            const width = grid[0].split(' ').length
            const full_name = {V: 'vampire', Z: 'zombie', G: 'ghost'}
            const MONSTER = ['V', 'Z', 'G']
            const DIR = {}

            const values = [
                [[-1, 0], { '/' : 'E', '\\': 'W' }, 'S'],
                [[1, 0],  { '/' : 'W', '\\': 'E' }, 'N'],
                [[0, -1], { '/' : 'S', '\\': 'N' }, 'E'],
                [[0, 1],  { '/' : 'N', '\\': 'S' }, 'W'],
            ]
            'NSWE'.split('').forEach((d, i)=>{
                DIR[d] = {
                    mod: values[i][0],
                    mirrored: values[i][1],
                    opposite: values[i][2],
                }
            })

            const grid_splitted = []
            for (let row of grid) {
                grid_splitted.push(row.split(' '))
            }

            const top_os = 50
            const os = 20
            const paper_width = 240
            const unit = paper_width / Math.max(height, width)

            /*----------------------------------------------*
             *
             * paper
             *
             *----------------------------------------------*/
            const paper = Raphael(tgt_node, unit*width+os*2, top_os+unit*height+os*2, 0, 0)

            /*----------------------------------------------*
             * step: #1
             * validate
             *
             *----------------------------------------------*/
            const [valid, error_msg] = validate_output(height, width)

            /*----------------------------------------------*
             * step: #2
             * check numbers
             *
             *----------------------------------------------*/
            const monster_total = {}
            const count_result = {N:[], S:[], W: [], E:[]}
            const output_splitted = []

            if (valid) {
                for (let row of output) {
                    output_splitted.push(row.split(' '))
                }

                // monster total
                const output_join = output.join('')
                for (const m of MONSTER) {
                    const reg = new RegExp(m, 'g')
                    monster_total[m] = (output_join.match(reg) || '').length == monsters[full_name[m]]
                }
                // count result
                for (const [sx, dr] of [[0, 'E'], [width-1, 'W']]) {
                    for (let sy = 0; sy < height; sy += 1) {
                        count_result[DIR[dr].opposite].push(
                            count_visible_monsters(sy, sx, dr, counts[DIR[dr].opposite][sy]))
                    }
                }
                for (const [sy, dr] of [[0, 'S'], [height-1, 'N']]) {
                    for (let sx = 0; sx < width; sx += 1) {
                        count_result[DIR[dr].opposite].push(
                            count_visible_monsters(sy, sx, dr, counts[DIR[dr].opposite][sx]))
                    }
                }
            }

            /*----------------------------------------------*
             * step: #3
             * draw top monsters
             *
             *----------------------------------------------*/
            const center = os+unit*(width / 2)
            const [left, right] = [center-41, center+41]
            const v_monster = 30
            const v_name = 6

            ghost(left, v_monster, 30)
            vampire(center, v_monster, 30)
            zombie(right, v_monster, 30)

            paper.text(left, v_monster, monsters.ghost).attr(attr.initial).attr(
                {'fill': ! valid || monster_total.G ? 'white' : 'red'})
            paper.text(center, v_monster, monsters.vampire).attr(attr.initial).attr(
                {'fill': ! valid || monster_total.V ? 'white' : 'red'})
            paper.text(right, v_monster, monsters.zombie).attr(attr.initial).attr(
                {'fill': ! valid || monster_total.Z ? 'white' : 'red'})

            paper.text(left, v_name, 'Ghost').attr(attr.ghost)
            paper.text(center, v_name, 'Vampire').attr(attr.vampire)
            paper.text(right, v_name, 'Zombie').attr(attr.zombie)

            /*----------------------------------------------*
             * step: #4
             * draw grid, count
             *
             *----------------------------------------------*/
            const font_size_count = {'font-size': Math.max(14 , 8*(8/Math.max(height, width)))}

            // horizontal
            for (let i = 0; i < height; i += 1) {
                paper.rect(os, top_os+i*unit+os, unit*width, unit).attr(attr.grid)
                paper.text(os/2, top_os+(i+0.5)*unit+os, counts.W[i]).attr(attr.number).attr(
                    font_size_count).attr({'fill': ! valid || count_result.W[i] ? 'black' : 'red'})
                paper.text(os+unit*width+os/2, top_os+(i+0.5)*unit+os, counts.E[i]).attr(attr.number).attr(
                    font_size_count).attr({'fill': ! valid || count_result.E[i] ? 'black' : 'red'})
            }

            // vertical
            for (let i = 0; i < width; i += 1) {
                paper.rect(i*unit+os, top_os+os, unit, unit*height).attr(attr.grid)
                paper.text((i+0.5)*unit+os, top_os+os/2, counts.N[i]).attr(attr.number).attr(
                    font_size_count).attr({'fill': ! valid || count_result.N[i] ? 'black' : 'red'})
                paper.text((i+0.5)*unit+os, top_os+os+unit*height+os/2, counts.S[i]).attr(attr.number).attr(
                    font_size_count).attr({'fill': ! valid || count_result.S[i] ? 'black' : 'red'})
            }

            /*----------------------------------------------*
             * step: #5
             * draw monsters, mirrors
             *
             *----------------------------------------------*/
            const font_size_monster = {'font-size': 8*(8/Math.max(height, width))}
            const scale = 4 / Math.max(height, width)
            for (let y = 0; y < height; y += 1) {
                for (let x = 0; x < width; x += 1) {
                    if (valid) {
                        const cell = output_splitted[y][x]
                        if (MONSTER.includes(cell)) {
                            if (cell == 'V') {
                                vampire(os+unit*(x+0.5), top_os+os+unit*(y+0.5), 40*scale)
                            } else if (cell == 'Z') {
                                zombie(os+unit*(x+0.5), top_os+os+unit*(y+0.5), 30*scale)
                            } else if (cell == 'G') {
                                ghost(os+unit*(x+0.5), top_os+os+unit*(y+0.5), 29*scale)
                            }
                        }
                    }

                    const grid_cell = grid_splitted[y][x]
                    if (grid_cell == '/') {
                        paper.path(['M', os+unit*(x+1-0.2), top_os+os+unit*(y+0.2), 'l', -unit*0.6, unit*0.6]).attr(
                            {'stroke-width': 5*scale})
                    } else if (grid_cell == '\\') {
                        paper.path(['M', os+unit*(x+0.2), top_os+os+unit*(y+0.2), 'l', unit*0.6, unit*0.6]).attr(
                            {'stroke-width': 5*scale})
                    }
                }
            }

            /*----------------------------------------------*
             * step: #6
             * message
             *
             *----------------------------------------------*/
            if (! valid) {
                $(tgt_node).addClass('output').prepend(
                    '<div>' + error_msg+ '<br/><br/></div>').css(
                        {'border': '0','display': 'block',})
            }

            /*----------------------------------------------*
             *
             * count visible monsters (function)
             *
             *----------------------------------------------*/
            function count_visible_monsters(sy, sx, sdr, num) {
                let [y, x, dr] = [sy, sx, sdr]
                let mirrored = false
                let counter = 0
                while (y >= 0 && y < output_splitted.length && x >= 0 && x < output_splitted[0].length) {
                    const cell = output_splitted[y][x]
                    if (MONSTER.includes(cell)) {
                        counter += mirrored ? cell != 'V' : cell != 'G'
                    } else {
                        mirrored = true
                        dr = DIR[dr].mirrored[cell]
                    }
                    const [dy, dx] = DIR[dr].mod
                    y += dy
                    x += dx
                }
                return counter == num
            }

            /*----------------------------------------------*
             *
             * validate output (function)
             *
             *----------------------------------------------*/
            function validate_output() {
                const is_array = Array.isArray(output)
                if (! is_array) {
                    return [false, "Wrong output format."]
                }

                if (output.length !== height) {
                    return [false, "Wrong output format."]
                }

                for (let y = 0; y < output.length; y += 1) {
                    const row = output[y]
                    const type = typeof row

                    if (type !== 'string') {
                        return [false, "Wrong output format."]
                    }

                    if (row.length !== grid[y].length) {
                        return [false, "Wrong output format."]
                    }

                    const [items, grid_items] = [row.split(' '), grid[y].split(' ')]
                    if (items.length !== grid_items.length) {
                        return [false, "Wrong output format."]
                    }

                    for (let x = 0; x < items.length; x += 1) {
                        const [cell, grid_cell] = [items[x], grid_items[x]]
                        if (grid_cell === '.') {
                            if (! ['V', 'Z', 'G'].includes(cell)) {
                                return [false, `Invalid monster (${y}, ${x}) : ${cell}`]
                            }
                        } else {
                            if (grid_cell !== cell) {
                                return [false, `Invalid mirror (${y}, ${x}) : ${cell}`]
                            }
                        }
                    }
                }
                return [true, 'good']
            }

            /*----------------------------------------------*
             *
             * vampire
             *
             *----------------------------------------------*/
            function vampire(x, y, px) {
                const v = paper.set()
                const z = px / 75
                v.push(paper.path(
                    ['M', x, y,
                    'm', -10*z, -37.5*z,
                    'l', -10*z, 25*z,
                    'l', 10*z, 50*z,
                    'l', 20*z, 0*z,
                    'l', 10*z, -50*z,
                    'l', -10*z, -25*z,
                    'z'
                    ]))
                return v.attr(attr.vampire)
            }

            /*----------------------------------------------*
             *
             * zombie
             *
             *----------------------------------------------*/
            function zombie(x, y, px) {
                const zo = paper.set()
                const z = px / 90
                zo.push(paper.circle(x, y-15*z, 30*z))
                zo.push(paper.rect(x-30*z, y-15*z, 60*z, 50*z))
                zo.push(paper.rect(x-35*z, y+35*z, 70*z, 10*z))
                zo.attr(attr.zombie)
                return zo
            }

            /*----------------------------------------------*
             *
             * ghost
             *
             *----------------------------------------------*/
            function ghost(x, y, px) {
                const g = paper.set()
                const z = px / 125
                g.push(paper.ellipse(x, y-7.5*z, 50*z, 55*z))
                g.push(paper.rect(x-50*z, y-7.5*z, 100*z, 40*z))
                g.push(paper.path(['M', x-50*z, y+27.5*z, 'l', 0, 30*z, 'l', 30*z, -30*z, 'z']))
                g.push(paper.path(['M', x+50*z, y+27.5*z, 'l', 0, 30*z, 'l', -30*z, -30*z, 'z']))
                g.push(paper.path(['M', x-45*z, y+27.5*z, 'l', 30*z, 30*z, 'l', 30*z, -30*z, 'z']))
                g.push(paper.path(['M', x-15*z, y+27.5*z, 'l', 30*z, 30*z, 'l', 30*z, -30*z, 'z']))
                g.attr(attr.ghost).attr({'stroke-width': (z*10)+'px'})
                return g
            }
        }

        var $tryit;
        var io = new extIO({
            multipleArguments: true,
            functions: {
                python: 'undead',
                // js: 'undead'
            },
            animation: function($expl, data){
                houseOfMirrorsAnimation(
                    $expl[0],
                    data,
                );
            }
        });
        io.start();
    }
);
