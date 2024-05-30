class ApiFetures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword;
    if (keyword) {
      this.query += ` WHERE name LIKE '%${keyword}%'`;
    }
    return this;
  }

  filter() {
    let queryConditions = [];
    const currentTimestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    if (this.queryStr.status) {
      if (this.queryStr.status === "active") {
        queryConditions.push(`end_time > '${currentTimestamp}'`);
      } else if (this.queryStr.status === "ended") {
        queryConditions.push(`end_time <= '${currentTimestamp}'`);
      }
    }

    if (queryConditions.length > 0) {
      if (this.query.includes("WHERE")) {
        this.query += ` AND ${queryConditions.join(" AND ")}`;
      } else {
        this.query += ` WHERE ${queryConditions.join(" AND ")}`;
      }
    }

    return this;
  }

  pagination(resultPerPage) {
    if (this.queryStr.page) {
      const currentPage = Number(this.queryStr.page) || 1;
      const skip = resultPerPage * (currentPage - 1);
      this.query += ` LIMIT ${resultPerPage} OFFSET ${skip}`;
    }
    return this;
  }

  getSqlCondition(conditionKey) {
    switch (conditionKey) {
      case "gt":
        return ">";
      case "gte":
        return ">=";
      case "lt":
        return "<";
      case "lte":
        return "<=";
      default:
        return "=";
    }
  }
}

module.exports = ApiFetures;
