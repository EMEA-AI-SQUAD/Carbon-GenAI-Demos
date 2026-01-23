python3.12 -m venv .llama.cpp.venv
source .llama.cpp.venv/bin/activate
dnf install -y make cmake automake llvm-toolset ninja-build gfortran curl-devel wget
sudo dnf install -y make cmake automake llvm-toolset ninja-build gfortran curl-devel wget
pip install --prefer-binary torch openblas --extra-index-url=https://wheels.developerfirst.ibm.com/ppc64le/linux
pip install --upgrade pip
git clone https://github.com/ggml-org/llama.cpp.git
cd llama.cpp
git checkout b6122
LD_LIBRARY_PATH=/opt/lib cmake -B build     -DGGML_BLAS=ON     -DGGML_BLAS_VENDOR=OpenBLAS     -DBLAS_LIBRARIES=/.venv/lib/python3.12/site-packages/openblas/lib/libopenblas.so     -DBLAS_INCLUDE_DIRS=/.venv/lib/python3.12/site-packages/openblas/include     -DGGML_CUDA=OFF
cmake --build build --config Release
LD_LIBRARY_PATH=/.venv/lib/python3.12/site-packages/openblas/lib:$LD_LIBRARY_PATH
cmake --build build --config Release
pwd
ls ..
ls /
ls /.llama.cpp.venv
ls /lib
ls /lib/python3.12
ls /lib/python3.12/site-packages
ls /lib/python3.12/site-packages/open*
echo $PATH
ls /home/cecuser/.llama.cpp.venv
ls /home/cecuser/.llama.cpp.venv/lib
ls /home/cecuser/.llama.cpp.venv/lib/python3.12
ls ~.llama.cpp.venv/lib/python3.12/site-packages
ls ~/.llama.cpp.venv/lib/python3.12/site-packages
LD_LIBRARY_PATH=/opt/lib cmake -B build     -DGGML_BLAS=ON     -DGGML_BLAS_VENDOR=OpenBLAS     -DBLAS_LIBRARIES=~/.llama.cpp.venv/lib/python3.12/site-packages/openblas/lib/libopenblas.so     -DBLAS_INCLUDE_DIRS=~/.llama.cpp.venv/lib/python3.12/site-packages/openblas/include     -DGGML_CUDA=OFF
cmake --build build --config Release
mkdir -p models
wget --quiet https://huggingface.co/ibm-granite/granite-4.0-micro-GGUF/resolve/main/granite-4.0-micro-Q4_K_M.gguf -O /models/granite-4.0-micro-Q4_K_M.gguf
wget --quiet https://huggingface.co/ibm-granite/granite-4.0-micro-GGUF/resolve/main/granite-4.0-micro-Q4_K_M.gguf -O models/granite-4.0-micro-Q4_K_M.gguf
ls
ls /
ls build
ls build/bin
./build/bin/llama-server -m models/granite-4.0-micro-Q4_K_M.gguf --host 0.0.0.0
ls
cd carbon-tutorial-nextjs
ls
cd src
ls
cd app
ls
head page.js
ls -al
cd ~
ls
source .carbonvenv/bin/activate
ls
mkdir -p /.local
sudo mkdir -p /.local
chmod -R a+rwx /.local
sudo chmod -R a+rwx /.local
pwd
ls
cd carbon-tutorial-nextjs
ls
cd src
cd app
ls
vi page.js
pwd
ls
cd ..
ls
cd ..
ls
cd notebooks
pwd
cd ~
ls
cd carbon-tutorial-nextjs
ls
cd src
cd app
ls -al
cp page.js page2.js
rm page.js
ls -al
df
ls
mv page2.js page.js
ls
head  globals.css
vi page.js
pwd
cd home
ls
vi page.js
pwd
cd ..
vi page.js
ls
cd entity-extraction/
vi page.js 
cd ..
ls
vi page.js
pwd
cd homr
cd home
ls
vi page.js
pwd
vi page.js
ls
vi _mixins.scss 
pwd
cd ../entextract/
ls
vi page.js 
dnf -y update
sudo dnf -y update
sudo dnf install -y python3.12 python3.12-pip python3.12-devel
python3.12 -m venv .carbonvenv
ls
source .carbonvenv/activate
source .carbonvenv/bin/activate
pip install --upgrade pip
pip install --prefer-binary jupyterlab --extra-index-url=https://wheels.developerfirst.ibm.com/ppc64le/linux
pip install --prefer-binary nodejs git gcc gcc-c++ --extra-index-url=https://wheels.developerfirst.ibm.com/ppc64le/linux
sudo dnf install -y gcc gcc-c++
pip install --prefer-binary nodejs git --extra-index-url=https://wheels.developerfirst.ibm.com/ppc64le/linux
sudo dnf install -y nodejs git
git clone https://github.com/carbon-design-system/carbon-tutorial-nextjs.git
npm install --global yarn
sudo npm install --global yarn
ls
cd carbon-tutorial-nextjs
yarn
yarn build
yarn add @carbon/react@1.33.0
yarn add sass@1.63.6
yarn add @carbon/icons-react
yarn add typescript
yarn add @octokit/core@4.2.0
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root --NotebookApp.token='' --NotebookApp.allow_origin='*'
yarn dev
yarn dev &
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root --NotebookApp.token='' --NotebookApp.allow_origin='*'
jobs
kill %1
jobs
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root --NotebookApp.token='' --NotebookApp.allow_origin='*'
jobs
mkdir notebooks
cd notebooks
pwd
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root --notebook-dir=~/carbon-tutorial-nextjs/notebooks --NotebookApp.token='' --NotebookApp.allow_origin='*'
git clone https://github.com/carbon-design-system/carbon-tutorial-nextjs.git
ls
cd carbon-tutorial-nextjs
yarn
yarn add typescript
yarn add @carbon/react@1.33.0 sass@1.63.6 @carbon/icons-react @octokit/core@4.2.0
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root --notebook-dir=~/carbon-tutorial-nextjs/notebooks --NotebookApp.token='' --NotebookApp.allow_origin='*'
ls
pwd
cd ~
ls
cd carbon-tutorial-nextjs
ls
rm -r notebooks
ls
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root --NotebookApp.token='' --NotebookApp.allow_origin='*'
ls
cd carbon-tutorial-nextjs
ls
cd src
cd app
ls
cd carbon/
ls
vi page.js
kill %1
vi page.js
pwd
vi page.js
cd ..
ls
cd home
ls
vi page.js
pwd
cd ..
pwd
cd ../..
ls
cd src
cd app
ls
cd carbon
ls
vi page.js
pwd
cd ../../..
pwd
ls
tar -cvf carbon-EMEA-AI-Power-demos.tar *
ls
cd src/app
cd entextract/
ls
vi page.js 
nano page.js
vim
sudo dnf install nano
nano page.js
ls
nano _mixins.scss 
nano page.js
nano _mixins.scss 
nano page.js
pwd
ls
cd carbon-tutorial-nextjs/
ls
tar -cvf carbon-EMEA-AI-Power-demos.tar *
source .carbonvenv/bin/activate
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root --NotebookApp.token='' --NotebookApp.allow_origin='*'
clear
pwd
ls
cd carbon-tutorial-nextjs/
ls
cd src
cd app
ls
cd entextract/
ls
nano page.js
source .carbonvenv/bin/activate
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root --NotebookApp.token='' --NotebookApp.allow_origin='*'
npm install openai
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root --NotebookApp.token='' --NotebookApp.allow_origin='*'
clear
source .llama.cpp.venv/bin/activate
./build/bin/llama-server -m models/granite-4.0-micro-Q4_K_M.gguf --host 0.0.0.0
ls
cd llama.cpp/
./build/bin/llama-server -m models/granite-4.0-micro-Q4_K_M.gguf --host 0.0.0.0
pwd
ls
cd carbon-tutorial-nextjs/
ls
tar -cvf carbon-EMEA-AI-Power-demos.tar *
cd ~
source .llama.cpp.venv/bin/activate
./build/bin/llama-server -m models/granite-4.0-micro-Q4_K_M.gguf --host 0.0.0.0
ls
cd llama.cpp/
./build/bin/llama-server -m models/granite-4.0-micro-Q4_K_M.gguf --host 0.0.0.0
source .carbonvenv/bin/activate
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root --NotebookApp.token='' --NotebookApp.allow_origin='*'
npm install cors
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root --NotebookApp.token='' --NotebookApp.allow_origin='*'
npm install express
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root --NotebookApp.token='' --NotebookApp.allow_origin='*'
clear
pwd
ls
cd carbon-tutorial-nextjs/
ls
cd src
cd app
cd entextract/
nano page.js
pwd
cd ../../..
ls
nano package.json 
cd src
cd spp
cd app
cd entextract/
ls
vi page.js
nano page.js
cd ../../..
ls
nano package.json 
cd src/app
cd entextract/
pwd
cd ../../..
ls
nano package.json 
source .carbonvenv/bin/activate
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root --NotebookApp.token='' --NotebookApp.allow_origin='*'
ls
cd carbon-tutorial-nextjs/
ls
cd src
ls
cd app
ls
cd entextract/
ls
nano page.js
cd carbon-tutorial-nextjs/
cd src/app/entextract/
ls
nano page.js
exit
clear
pwd
cd carbon-tutorial-nextjs/
ls
cd src/app
ls
cd ..
ls
mkdir llama-proxy
cd llama-proxy/
ls
npm init -y
npm install express cors http-proxy-middleware
nano server.ja
clear
ls
mv server.ja server.js
node server.js
curl http://localhost:8080
curl http://localhost:8080/health
node server.js
nano server.js
node server.js
nano server.js
node server.js
nano server.js
node server.js
nano server.js
source .llama.cpp.venv/bin/activate
./build/bin/llama-server -m models/granite-4.0-micro-Q4_K_M.gguf --host 0.0.0.0
cd llama.cpp/
./build/bin/llama-server -m models/granite-4.0-micro-Q4_K_M.gguf --host 0.0.0.0
./build/bin/llama-server -m models/granite-4.0-micro-Q4_K_M.gguf --host 0.0.0.0 --cors-allow-origin "http://localhost:3000"
./build/bin/llama-server -m models/granite-4.0-micro-Q4_K_M.gguf --host 0.0.0.0
source .carbonvenv/bin/activate
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root --NotebookApp.token='' --NotebookApp.allow_origin='*'
pwd
cd carbon-tutorial-nextjs/
ls
yarn dev
pwd
ls
cd src/app/entextract/
ls
nano page.js 
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:8080/health
curl http://localhost:3001/health
cd ../../..
ls
yarn dev
source .carbonvenv/bin/activate
cd carbon-tutorial-nextjs/
ls
yarn dev
ls
cd src/
ls
cd app/
ls
vim page.js 
cd .
cd ..
ls
cd components/
ls
cd TutorialHeader/
ls
cd ..
ls
cd ..
ls
cd app/
ls
vim providers.js 
cd carbon/
ls
cd ..
ls
cd home/
ls
vim page.js 
ls
cd ..
ls
cd entextract/
ls
cat page.js 
ls
cd ..
ls
cat page.
cat page.js 
ls
cd home/
ls
cat page.js 
cd ..
ls
cd carbon/
ls
cd ..
ls
cd carbon/
ls
cat page.js 
ls
cd ..
ls
ls
curl http://localhost:3001/health
source .carbonvenv/bin/activate
source .llama.cpp.venv/bin/activate
ls
cd llama.cpp
./build/bin/llama-server -m models/granite-4.0-micro-Q4_K_M.gguf --host 0.0.0.0
source .carbonvenv/bin/activate
ls
cd carbon-tutorial-nextjs/
ls
cd ..
ls
cd llama.cpp/
la
ls
cd ..
ls
cd ..
ls
cd cecuser/
ls
cd carbon-tutorial-nextjs/
ls
cd src/
ls
cd llama-proxy/
npm start
ls
cat server.js 
ls
node server.js 
ls
vim server_two.js
sudo dnf instal vim
sudo dnf install vim
vim server_two.js
node server_two.js 
vim server_three.js
node server_three.js.js 
node server_three.js
source .carbonvenv/bin/activate
cd carbon-tutorial-nextjs
ls
cd public/
ls
cd ..
ls
cat package.json 
ls
cd src/
ls
cd app/
ls
cat page.js 
cd ..
ls
cd ..
ls
cd ..
ls
cd node_modules/
ls
cd ..
ls
cd ..
ls
cd cecuser/
ls
cd carbon-tutorial-nextjs/
ls
cd ..ls
ls
cd src/
ls
cd app/
ls
cat page.js 
cd ..
ls
cd app/
ls
cd home/
ls
cat page.js 
ls
vim page.js 
cd ..
ls
yarn dev
ls
cd ..
ls
cd app/
ls
cd home/
ls
cd ..
ls
cat page.
cat page.js 
cd home/
ls
vim page.js 
cd ..
ls
yarn dev
grep -r "openai" .
ls
cd entextract/
ls
cat page.js 
ls
vim page.js 
cd ..
ls
yarn dev
ls
cd entextract/
ls
vim page.js 
cat page.js 
ls
mv page_old.js
mv page.js page_old.js
cp page_old.js page.js
vim page.js 
cd ..
ls
yarn dev
ls
vim page.js 
ls
cd home/
ls
vim page.js 
ls
cd ..
ls
cd entextract/
ls
vim page.js s
ls
cd ..
ls
yarn dev
ls
cd entextract/
ls
vim page.js 
cd ..
yarn dev
curl -X POST http://localhost:3001/completion   -H "Content-Type: application/json"   -d '{
    "prompt": "Explain carbon capture in simple terms",
    "n_predict": 128,
    "temperature": 0.7
  }'
curl -X POST http://localhost:3001/completion   -H "Content-Type: application/json"   -d '{
    "prompt": "Explain carbon capture in simple terms",
    "n_predict": 128,
    "temperature": 0.7
  }'
curl -X POST http://localhost:3001/completion   -H "Content-Type: application/json"   -d '{
    "prompt": "Explain carbon capture in simple terms",
    "n_predict": 128,
    "temperature": 0.7
  }'
ls
yarn dev
ls
cd entextract/
ls
vim page.js 
yarn dev
ls
vim page.js 
yarn dev
ls
vim page.js 
ls
cd carbon-tutorial-nextjs/
ls
cd src/
ls
cd llama-proxy/
node server_three.js
ls
node server_three.js
ls
cat server_three.js 
ls
vim server_last.js
node server_last.js 
ls
cat server_last.js 
vim server_ac_last.py
rm server_ac_last.py 
vim server_ac_last.js
node server_ac_last.js 
ls
cat server_ac_last.js 
ls
vim server_ac_last.js 
vim server_ac_last.js
node server_three.js
node server_ac_last.js 
ls
cat server_ac_last.js 
ls
node server_ac_last.js 
cat server_ac_last.js 
ls
cat server_ac_last.js 
curl -X POST http://localhost:8080/completion   -H "Content-Type: application/json"   -d '{
    "prompt": "Explain carbon capture in simple terms",
    "n_predict": 128,
    "temperature": 0.7
  }'
node server_ac_last.js 
curl -X POST http://localhost:8080/completion   -H "Content-Type: application/json"   -d '{
    "prompt": "Explain carbon capture in simple terms",
    "n_predict": 128,
    "temperature": 0.7
  }'
ls
cat server_ac_last.js 
node server_ac_last.js 
curl -X POST http://localhost:8080/completion   -H "Content-Type: application/json"   -d '{
    "prompt": "Explain carbon capture in simple terms",
    "n_predict": 128,
    "temperature": 0.7
  }'
node server_ac_last.js 
ls
cat server_ac_last.js 
ls
vim server_final.js
node server_ac_last.js 
mpde server_final.js 
node server_final.js 
ls
cat server_final.js 
ls
rm server.js server_ac_last.js server_last.js server_three.js server_two.js 
ls
node server_final.js 
ls
LD_LIBRARY_PATH=/opt/lib cmake -B build     -DGGML_BLAS=ON     -DGGML_BLAS_VENDOR=OpenBLAS     -DBLAS_LIBRARIES=~/.llama.cpp.venv/lib/python3.12/site-packages/openblas/lib/libopenblas.so     -DBLAS_INCLUDE_DIRS=~/.llama.cpp.venv/lib/python3.12/site-packages/openblas/include     -DGGML_CUDA=OFF
cd llama.cpp/
./build/bin/llama-server -m models/granite-4.0-micro-Q4_K_M.gguf --host 0.0.0.0
curl http://localhost:3001/health
ls
./build/bin/llama-server -m models/granite-4.0-micro-Q4_K_M.gguf --host 0.0.0.0
./build/bin/llama-server -m models/granite-4.0-micro-Q4_K_M.gguf --host 0.0.0.0 --verbose
ls
cd carbon-tutorial-nextjs/
ls
cd src/
ls
realpath llama-proxy/
ls
cd carbon-tutorial-nextjs/
ls
tar -cvf carbon-EMEA-AI-Power-demos.tar *
exit
clear
ls
cd car
cd carbon-tutorial-nextjs/
ls
cd src
cd app
cd entextract/
ls
rm setupProxy.js 
nano page.js
source .carbonvenv/bin/activate
cd carbon-tutorial-nextjs/
yarn dev
ls
cd src
ls
ls -al
cd llama-proxy/
ls
cd ..
ls
pwd
cd pwd
ls
pwd
cd ..
la
ls
yarn dev
source .carbonvenv/bin/activate
cd carbon-tutorial-nextjs/
yarn dev
clear
cd carbon-tutorial-nextjs/
cd src
cd app
cd entextract/
ls
nano page.js
clear
cd carbon-tutorial-nextjs/
cd src
cd app
cd entextract/
ls
nano page.js
ls -al
date
nano page.js.save
source .carbonvenv/bin/activate
cd carbon-tutorial-nextjs/
yarn dev
source .carbonvenv/bin/activate
cd carbon-tutorial-nextjs/
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root --NotebookApp.token='' --NotebookApp.allow_origin='*'
cd carbon-tutorial-nextjs/
ls
cd src
cd app
cd entextract/
ls
ls -al 
nano page.js
clear
nano page.js
source .carbonvenv/bin/activate
cd carbon-tutorial-nextjs/
yarn dev
cd carbon-tutorial-nextjs/
cd src
cd app
cd entextract/
ls
clear
ls
ls -al
nano page.js.save
cd carbon-tutorial-nextjs/
ls
tar -cvf carbon-EMEA-AI-Power-demos.tar *
zip carbon-EMEA-AI-Power-demos.tar
gzip carbon-EMEA-AI-Power-demos.tar
ls -al
cd src/app/entextract/
ls
ls -al
rm page_old.js
ls
rm page.js.save.1
ls
cd ../..
pwd
cd ..
yarn dev
cd carbon-tutorial-nextjs/
ls
cd src/app/entextract/
nano page.js
cd carbon-tutorial-nextjs/
cd src/app/entextract/
ls
nano page.js
ls
nano _entextract-page.scss
nano page.js
nano _entextract-page.scss
nano page.js
nano _entextract-page.scss
nano page.js
source .carbonvenv/bin/activate
cd carbon-tutorial-nextjs/
yarn dev
cd carbon-tutorial-nextjs/
ls
cd src
ls
cd app
ls
nano globals.scss 
nano page.module.css 
cd entextract/
ls
nano _mixins.scss 
nano _overrides.scss 
pwd
cd ../../..
ls
yarn dev
cd carbon-tutorial-nextjs/
yarn dev
clear
cd carbon-tutorial-nextjs/
cd src/app/entextract/
ls
nano page.js
cd carbon-tutorial-nextjs/
cd src/app/entextract/
ls
nano _entextract-page.scss 
ls -al
cat _entextract-page.scss | grep landing-page
cat *.scss | grep landing-page
cat *.scss | grep tabs-group
ls
nano _entextract-page.scss 
clear
cd carbon-tutorial-nextjs/
cd src
cd app
cd entextract/
ls
cat *.scss | grep tabs-group-content
nano _entextract-page.scss 
pwd
ls -al
mv default.js defaults.js
cd carbon-tutorial-nextjs/
ls
tar -cvf carbon-EMEA-AI-Power-demos.tar
rm carbon-EMEA-AI-Power-demos.tar.gz
tar -cvf carbon-EMEA-AI-Power-demos.tar *
gzip carbon-EMEA-AI-Power-demos.tar
exit
source .carbonvenv/bin/activate
cd carbon-tutorial-nextjs/
yarn dev
source .llama.cpp.venv/bin/activate
cd llama.cpp
./build/bin/llama-server -m models/granite-4.0-micro-Q4_K_M.gguf --host 0.0.0.0
cd carbon-tutorial-nextjs/
ls
cd src
cd app
cd entextract/
ls
nano page.js
nano types.ts
nano defaults.ts
nano messages.ts
rm *.ts
nano default.js
nano messages.js
nano postprocess.js
nano page.js
nano extraction.js
nano page.js
ls
cat extraction.js 
nano page.js
source .carbonvenv/bin/activate
cd carbon-tutorial-nextjs/
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root --NotebookApp.token='' --NotebookApp.allow_origin='*'
cd src
ls
cd carbon-tutorial-nextjs/
cd src
ls
cd llama-proxy/
ls
node server_final.js
