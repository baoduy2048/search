FROM elasticsearch:8.7.0

# Cài đặt ICU Analysis Plugin
RUN bin/elasticsearch-plugin install --batch analysis-icu
