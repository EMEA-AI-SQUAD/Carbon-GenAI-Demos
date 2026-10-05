import json
t = open("/tmp/doc1.txt").read()
json.dump({"text": t, "schema_name": "vehicle_import"}, open("/tmp/extract_doc1.json", "w"))
print("ok")
