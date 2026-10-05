from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./finxtract.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
# TODO: Fix _TSessionMakerType: _SessionProtocol | _AsyncSessionProtocol] sessionmaker(self, bind: Connection | Engine | AsyncConnection | AsyncEngine | None, class_: type[_TSessionMakerType], autoflush: bool = ..., autocommit: bool = ..., expire_on_commit: bool = ..., info: MutableMapping[Any, Any] | None = ..., **kw: Any) -> sessionmaker[Session
# def

Base = declarative_base()
