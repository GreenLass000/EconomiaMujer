from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URI
from models import Base, Person, IncomeList, SpentList

def ensure_database_exists():
    """Crea la base de datos MySQL configurada cuando todavía no existe."""
    url = make_url(DATABASE_URI)
    if url.get_backend_name() != "mysql" or not url.database:
        return

    database_name = url.database.replace("`", "``")
    server_engine = create_engine(url.set(database=None), isolation_level="AUTOCOMMIT")
    try:
        with server_engine.connect() as connection:
            connection.execute(text(
                f"CREATE DATABASE IF NOT EXISTS `{database_name}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            ))
    finally:
        server_engine.dispose()


# Crear la base, el motor y la sesión de SQLAlchemy.
ensure_database_exists()
engine = create_engine(DATABASE_URI)
Session = sessionmaker(bind=engine)


def get_session():
    """
    Crea y devuelve una nueva sesión de SQLAlchemy.

    Returns:
        session (Session): Una nueva instancia de sesión de SQLAlchemy.
    """
    return Session()


def init_db():
    """
    Inicializa la base de datos creando todas las tablas definidas en los modelos,
    verifica o crea la persona Programa Mujer y los elementos de IncomeList y SpentList.
    """
    # Crear todas las tablas
    with engine.connect() as connection:
        Base.metadata.create_all(bind=engine)

    # Crear la persona Programa Mujer si no existe.
    with get_session() as session:
        try:
            # Comprobar si la persona existe
            person = session.query(Person).filter_by(
                firstName="Programa", lastName="Mujer").first()
            if not person:
                # Crear la persona si no existe
                new_person = Person(
                    firstName="Programa",
                    lastName="Mujer",
                    isconcertado=False,
                    isactive=True,
                    date_joined=datetime.utcnow()
                )
                session.add(new_person)
                session.commit()
                print("Persona 'Programa Mujer' creada.")
            else:
                print("Persona 'Programa Mujer' ya existe.")

            # Comprobar si la tabla IncomeList está vacía
            income_list_count = session.query(IncomeList).count()
            if income_list_count == 0:
                # Añadir elementos a IncomeList
                income_items = [
                    "Aportacion Familiar",
                    "Propios",
                    "Traspaso Administracion",
                    "Otros"
                ]
                for item in income_items:
                    formatted_item = item.capitalize()
                    new_income_item = IncomeList(name=formatted_item)
                    session.add(new_income_item)
                session.commit()
                print("Elementos añadidos a IncomeList.")
            else:
                print("IncomeList ya contiene elementos.")

            # Comprobar si la tabla SpentList está vacía
            spent_list_count = session.query(SpentList).count()
            if spent_list_count == 0:
                # Añadir elementos a SpentList
                spent_items = [
                    ("PELUQUERIA", False),
                    ("ALIMENTACIÓN", True),
                    ("ENSERES Y MENAJE", True),
                    ("FARMACIA", True),
                    ("HIGIENE", True),
                    ("TABACO", True),
                    ("OCIO Y TIEMPO LIBRE", True),
                    ("ROPA", True),
                    ("TRANSPORTE", True),
                    ("PAPELERIA", True),
                    ("OTROS", True)
                ]
                for name, isconcertado in spent_items:
                    formatted_name = name.capitalize()
                    new_spent_item = SpentList(
                        name=formatted_name, isconcertado=isconcertado)
                    session.add(new_spent_item)
                session.commit()
                print("Elementos añadidos a SpentList.")
            else:
                print("SpentList ya contiene elementos.")
        except Exception as e:
            session.rollback()
            print(f"Error al comprobar o crear elementos: {e}")
