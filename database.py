from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./finxtract.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
# TODO: Fix call-overload
# No overload variant of "sessionmaker" matches argument types "bool", "bool", "Engine"

Base = declarative_base()
