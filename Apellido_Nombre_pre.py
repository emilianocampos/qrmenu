

cantidad_examenes = 0
ingreso_cantidad_valido = False

while not ingreso_cantidad_valido:
    entrada_cantidad = input("Ingrese la cantidad de exámenes parciales (1 a 10): ")
    if entrada_cantidad.isdigit():
        temp_cantidad = int(entrada_cantidad)
        if 1 <= temp_cantidad <= 10:
            cantidad_examenes = temp_cantidad
            ingreso_cantidad_valido = True
        else:
            print("Error: Debe ingresar un número entero válido.")
    else:
        print("Error: Debe ingresar un número entero válido.")

nota_maxima = 0.0
nota_minima = 11.0
suma_notas = 0.0
aprobados = 0
desaprobados = 0

examen_actual = 1
while examen_actual <= cantidad_examenes:
    entrada_nota = input("Ingrese la nota del examen " + str(examen_actual) + " (1 a 10): ")
    
    es_valido = True
    if entrada_nota == "":
        es_valido = False
    else:
        puntos = 0
        for caracter in entrada_nota:
            if caracter == ".":
                puntos += 1
            elif not caracter.isdigit():
                es_valido = False
        
        if puntos > 1 or entrada_nota == ".":
            es_valido = False
            
    if es_valido:
        nota = float(entrada_nota)
        if 1.0 <= nota <= 10.0:
            if examen_actual == 1:
                nota_maxima = nota
                nota_minima = nota
            else:
                if nota > nota_maxima:
                    nota_maxima = nota
                if nota < nota_minima:
                    nota_minima = nota
            
            suma_notas += nota
            
            if nota >= 6.0:
                aprobados += 1
            else:
                desaprobados += 1
                
            examen_actual += 1
        else:
            print("Error: La calificación debe estar en el rango cerrado de 1 a 10.")
    else:
        print("Error: Formato de nota inválido. Use números (ej: 7 o 7.5).")

promedio = suma_notas / cantidad_examenes

print("\n=========================================")
print("          REPORTE DE RENDIMIENTO")
print("=========================================")
print(f"Nota más alta obtenida: {nota_maxima:.1f}")
print(f"Nota más baja obtenida: {nota_minima:.1f}")
print(f"Promedio general:       {promedio:.2f}")
print(f"Exámenes Aprobados:     {aprobados}")
print(f"Exámenes Desaprobados:  {desaprobados}")
print("-----------------------------------------")

if promedio >= 7:
    condicion = "PROMOCIONADO"
elif 4 <= promedio < 7:
    condicion = "REGULAR"
else:
    condicion = "LIBRE"

print(f"Condición Final del Alumno: {condicion}")
print("=========================================")

esperando_salida = True
while esperando_salida:
    salida = input("Presione la tecla Espacio y luego Enter para terminar el programa: ")
    if salida == " ":
        esperando_salida = False
