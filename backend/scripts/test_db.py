from sqlmodel import Session, select

from models.user import User
from services.db import create_db_and_tables, get_engine, get_session


def main():
    print('Creating tables (if not exist)...')
    create_db_and_tables()
    engine = get_engine()
    print('Engine:', engine)

    # quick session test
    with Session(engine) as session:
        print('Opened session')
        users = session.exec(select(User)).all()
        print('Users count:', len(users))


if __name__ == '__main__':
    main()
