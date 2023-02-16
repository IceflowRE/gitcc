#!/usr/bin/env python
from pathlib import Path

from setuptools import find_packages, setup

# get long description
with Path('README.rst').open(mode='r', encoding='UTF-8') as reader:
    LONG_DESCRIPTION = reader.read()

setup(
    name="gitcc",
    version="2.0.1",
    description="GIT Commit Check - check the commit for certain rules",
    long_description=LONG_DESCRIPTION,
    long_description_content_type='text/x-rst',
    author="Iceflower S",
    author_email="iceflower@gmx.de",
    license='MIT',
    url="https://github.com/IceflowRE/gitcc",
    classifiers=[
        'Programming Language :: Python :: 3.10',
        'License :: OSI Approved :: MIT License',
        'Development Status :: 5 - Production/Stable',
        'Operating System :: OS Independent',
        'Intended Audience :: Developers',
        'Natural Language :: English',
        'Environment :: Console',
    ],
    keywords='git commit naming checker',
    packages=find_packages(include=['gitcc', 'gitcc.*']),
    python_requires='>=3.9',
    install_requires=[
        "GitPython==3.1.30",
    ],
    extras_require={
        'dev': [
            'flake8',
            # flake8 extensions start
            'wemake-python-styleguide',
            'flake8-2020',
            'flake8-builtins',
            'flake8-comprehensions',
            'flake8-docstrings',
            'flake8-multiline-containers',
            'flake8-use-fstring',
            'flake8-simplify',
            # flake8 extensions end
            'mypy',
            'pylint',
            'pyroma',
            'setuptools',
            'twine>=4.0.0',
        ],
    },
    zip_safe=True,
    entry_points={
        'console_scripts': [
            'gitcc = gitcc.main:main',
        ],
    },
)
