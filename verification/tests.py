import re

spec_pattern = r'(\d)x(\d):\d+,\d+,\d+,[a-zLR]+[,0-9]+'
test_pattern = (
    r'G: (\d+) V: (\d+) Z: (\d+)\n'
    r'([ 0-9]+)\n'
    r'((?:[ 0-9GVZ\\/]+\n)+)'
    r'([ 0-9]+)\n'
)

DATA = r'''
4x4:2,2,4,aLaRLcRLaLaLRa,3,0,3,0,0,3,0,1,4,1,1,2,0,0,0,4
G: 2 V: 2 Z: 4
   3 0 3 0
 4 Z \ V / 0
 0 \ Z G V 3
 0 / \ Z \ 0
 0 G \ / Z 1
   2 1 1 4

4x6:3,5,4,LeLRRLaLRaLLdRRaR,2,1,2,0,1,0,0,3,4,0,0,3,3,0,2,4,0,0,3,0
G: 3 V: 5 Z: 4
   2 1 2 0
 0 \ G V G 1
 3 V G \ / 0
 0 / \ Z \ 0
 0 / V \ \ 3
 4 Z V Z Z 4
 2 / / V / 0
   0 3 3 0

7x5:6,10,9,cRbRbLRkLcRLaRaLbL,3,5,0,3,3,7,1,0,4,6,0,1,3,0,3,0,5,0,3,2,0,6,4,2
G: 6 V: 10 Z: 9
   3 5 0 3 3 7 1
 2 Z Z G / V V / 0
 4 Z Z \ / G V V 4
 6 G Z Z V Z Z V 6
 0 G \ Z V V / \ 0
 2 V / V \ G G \ 1
   3 0 5 0 3 0 3

4x4:5,1,2,LdRLaRLaLbLR,3,0,1,0,0,1,2,0,0,2,2,2,2,0,2,0
G: 5 V: 1 Z: 2
   3 0 1 0
 0 \ G G G 0
 2 V / \ G 1
 0 / \ G \ 2
 2 Z Z \ / 0
   2 2 2 0

4x5:7,3,4,aRfRdRaRLbR,1,0,4,2,3,0,3,4,0,0,4,4,0,0,5,1,0,1
G: 7 V: 3 Z: 4
   1 0 4 2
 1 V / Z G 3
 0 G G G G 0
 1 / Z Z G 3
 5 V / Z / 4
 0 \ G V / 0
   0 4 4 0

4x7:2,9,5,aRaLRaRaLaLRbLReRcRaR,1,0,1,0,0,5,1,0,4,2,0,0,4,0,3,2,5,4,2,3,0,1
G: 2 V: 9 Z: 5
   1 0 1 0
 1 V / Z \ 0
 0 / V / Z 5
 3 \ V \ / 1
 2 G Z \ / 0
 4 V V V V 4
 5 Z / G V 2
 2 Z / V / 0
   3 0 4 0

5x5:6,5,6,aRbLLdLRcLaRcLc,4,1,0,5,0,0,3,5,3,4,6,5,0,0,1,1,0,3,5,1
G: 6 V: 5 Z: 6
   4 1 0 5 0
 1 Z / G Z \ 0
 5 \ G G Z V 3
 3 \ / G Z Z 5
 0 \ V / V V 3
 1 V \ G Z G 4
   1 0 0 5 6

5x6:11,8,3,dRRaLeLLcRLgRb,1,4,2,0,3,0,2,0,2,1,0,3,1,2,4,5,8,1,3,5,0,2
G: 11 V: 8 Z: 3
   1 4 2 0 3
 2 V G Z G / 0
 0 / V \ G V 2
 5 Z V Z \ \ 0
 3 G V G / \ 2
 1 G G G G V 1
 8 V V / G G 0
   5 4 2 1 3

6x6:4,7,15,aLaLdLeRaRLbRaRkLL,5,5,4,1,4,2,2,4,2,1,4,4,1,4,5,4,4,5,4,4,3,4,0,5
G: 4 V: 7 Z: 15
   5 5 4 1 4 2
 5 Z \ Z \ V Z 2
 0 G G \ Z Z Z 4
 4 V V / V / \ 2
 3 Z Z / Z / Z 1
 4 V G Z G V V 4
 4 Z Z Z Z \ \ 4
   5 4 4 5 4 1

7x6:9,10,6,aLaRaLLaLjLLRaRLLcRRRdLLRc,3,0,5,0,2,0,0,0,2,0,4,0,3,8,4,7,3,3,1,2,1,0,0,7,2,4
G: 9 V: 10 Z: 6
   3 0 5 0 2 0 0
 4 V \ V / G \ \ 0
 2 V \ V G G G V 2
 7 V V Z G V \ \ 0
 0 / V / \ \ Z V 4
 0 G / / / G G G 0
 1 Z \ \ / Z Z Z 3
   2 1 3 3 7 4 8

7x7:5,13,6,aLcLbLRRaRbLaLRLaLRRLLaLLaRLaLbLcLcLaRLa,3,0,2,2,2,0,3,1,2,2,2,4,1,0,3,0,0,2,2,1,1,0,2,2,1,3,3,0
G: 5 V: 13 Z: 6
   3 0 2 2 2 0 3
 0 G \ V V V \ V 1
 3 V \ / / V / Z 2
 3 Z \ V \ / \ Z 2
 1 \ / / \ \ V \ 2
 2 \ V / \ V \ Z 4
 2 Z \ V V V \ Z 1
 0 G G \ G / \ G 0
   1 1 2 2 0 0 3

7x7:7,12,10,bLbReLaRbLLRRcLLRaRRLcLLLdLcLcL,4,6,0,6,1,0,1,4,4,1,0,0,7,1,3,5,1,4,1,3,1,1,0,4,4,3,4,3
G: 7 V: 12 Z: 10
   4 6 0 6 1 0 1
 3 Z Z \ V V / V 4
 4 Z G Z Z \ V / 4
 3 Z Z \ \ / / Z 1
 4 Z V \ \ / V / 0
 4 / \ G G G \ \ 0
 0 \ Z V V G \ V 7
 1 V G \ V G V \ 1
   1 3 1 4 1 5 3

7x7:13,16,2,jLaLReRLdRLLaLLaLRaLcLRLaLdR,4,0,4,4,4,0,2,4,0,0,0,1,0,0,0,1,5,5,6,1,0,0,1,1,5,4,3,4
G: 13 V: 16 Z: 2
   4 0 4 4 4 0 2
 4 V G V G Z G V 4
 3 G G V \ G \ / 0
 4 G G V V G / \ 0
 5 Z G V G / \ \ 0
 1 V \ \ V \ / V 1
 1 \ V V G \ / \ 0
 0 G \ V V V V / 0
   0 1 6 5 5 1 0
'''

table = str.maketrans('GVZ', '...')


def groups2test(groups):
    *gvz, north, grid, south = groups
    monsters = {monster: int(nb)
                for monster, nb in zip(('ghost', 'vampire', 'zombie'), gvz)}
    counts = {'N': north.strip().split(),
              'S': south.strip().split(),
              'W': [], 'E': []}
    lines = [x.strip().split() for x in grid.splitlines()]
    for line in lines:
        counts['E'].append(line.pop())
        counts['W'].append(line.pop(0))
    answer = list(map(' '.join, lines))
    house = tuple(line.translate(table) for line in answer)
    counts = {k: list(map(int, v)) for k, v in counts.items()}
    return {'input': (house, monsters, counts), 'answer': answer}


all_groups = re.findall(test_pattern, DATA)

TESTS = {'Basic': list(map(groups2test, all_groups[:3])),
         'Extra': list(map(groups2test, all_groups[3:]))}


if __name__ == '__main__':
    assert len(all_groups) == 13

    from pprint import pprint
    # pprint([(*t['input'], t['answer'])
    #         for tests in TESTS.values() for t in tests])
    pprint(TESTS)

    # For "info/task_description.html"
    test = TESTS['Basic'][0]
    print(test['input'], test['answer'])
    url = 'https://www.chiark.greenend.org.uk/~sgtatham/puzzles/js/undead.html'
    link = '<a href="{url}#{spec}" title="{r} rows, {c} columns">{text}</a>'
    print('To play the puzzles / tests yourself:')
    for index, m in enumerate(re.finditer(spec_pattern, DATA), 1):
        print(link.format(url=url, spec=m.group(),
                          r=m.group(2), c=m.group(1),
                          text=index))


# from itertools import chain


# def line(iterator, nb): return tuple(next(iterator) for _ in range(nb))


# def specific2grid(specific):
#     dim, specific = specific.split(':')
#     nb_cols, nb_rows = map(int, dim.split('x'))
#     ghost, vampire, zombie, specific, *numbers = specific.split(',')
#     monsters = {'ghost': int(ghost),
#                 'vampire': int(vampire),
#                 'zombie': int(zombie)}
#     numbers = map(int, numbers)
#     numbers = {'N': line(numbers, nb_cols),
#                'E': line(numbers, nb_rows),
#                'S': line(numbers, nb_cols)[::-1],
#                'W': line(numbers, nb_rows)[::-1]}
#     table = {'R': '/', 'L': '\\'}
#     specific = chain.from_iterable(
#         table.get(s, '.' * (ord(s) - ord('a') + 1))
#         for s in specific)
#     grid = [''.join(line(specific, nb_cols)) for _ in range(nb_rows)]
#     return nb_rows * nb_cols, (tuple(grid), monsters, numbers)
