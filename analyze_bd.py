with open('bd.sql', 'r', encoding='latin1') as f:
    lines = f.readlines()

current_table = None
tables = {}
for line in lines:
    if 'CREATE TABLE IF NOT EXISTS' in line:
        parts = line.split('`')
        if len(parts) >= 2:
            current_table = parts[1]
            tables[current_table] = []
    elif current_table and line.strip().startswith('`'):
        tables[current_table].append(line.strip().rstrip(','))
    elif current_table and line.strip().startswith(') ENGINE'):
        current_table = None

def print_table(t):
    if t in tables:
        print(f"\n==================== TABLE: `{t}` ====================")
        for col in tables[t]:
            print('  ', col)
    else:
        print(f"\n==================== TABLE: `{t}` (NOT FOUND) ====================")

# Check employee, waiter, user tables
for t in ['mxemp', 'mxper', 'mxusu', 'mxteremp', 'mxmenemp']:
    print_table(t)

# Find any table with columns containing 'mozo' or 'empleado' or 'nombre'
print("\nTables with columns matching 'mozo' or 'emp':")
for t, cols in tables.items():
    col_str = ' '.join(cols).lower()
    if 'mozo' in col_str or 'cod_emp' in col_str or ('nombre' in col_str and 'emp' in t):
        print(f" - {t}: {[c.split()[0] for c in cols if 'mozo' in c.lower() or 'nombre' in c.lower() or 'codigo' in c.lower() or 'cod_emp' in c.lower()]}")
