import pandas as pd
from pymongo import MongoClient

# 1. Connection string correto
connection_string = "mongodb+srv://jessica:DevScope123@cluster0.ywnuorm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# 2. Conectar ao MongoDB
client = MongoClient(connection_string)
db = client["contratos"]
collection = db["contratos"]

# 3. Ler o Excel
df = pd.read_excel("anuncios2025.xlsx")

# 4. Filtrar apenas contratos relacionados com software
# Procura a palavra "software" em qualquer coluna de texto
df_filtrado = df[df.apply(
    lambda row: row.astype(str).str.contains("software", case=False, na=False).any(),
    axis=1
)]

# 5. Converter para dicionários
registos = df_filtrado.to_dict(orient="records")
# print(len(registos))
# print("Olá")

# 6. Inserir no MongoDB
if registos:
     resultado = collection.insert_many(registos) 
     print(f"{len(resultado.inserted_ids)} contratos de software inseridos com sucesso!")
else:
     print("Nenhum contrato de software encontrado no Excel.")