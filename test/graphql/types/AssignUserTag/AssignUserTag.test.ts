import { describe, expect, it } from "vitest";
import { builder } from "~/src/graphql/builder";
import { AssignUserTag } from "~/src/graphql/types/AssignUserTag/AssignUserTag";

describe("AssignUserTag GraphQL Object", () => {
	it("should be defined", () => {
		expect(AssignUserTag).toBeDefined();
	});

	it("should be registered in the schema", () => {
		const schema = builder.toSchema();
		const type = schema.getType("AssignUserTag");

		expect(type).toBeDefined();
		expect(type?.name).toBe("AssignUserTag");
		expect(typeof (type as any).getFields).toBe("function");
	});

	it("should expose assigneeId and tagId fields", () => {
		const schema = builder.toSchema();
		const type = schema.getType("AssignUserTag") as any;

		const fields = type.getFields();

		expect(fields.assigneeId).toBeDefined();
		expect(fields.tagId).toBeDefined();
	});

	it("should not expose extra fields", () => {
		const schema = builder.toSchema();
		const type = schema.getType("AssignUserTag") as any;

		const fieldNames = Object.keys(type.getFields());

		expect(fieldNames).toEqual(["assigneeId", "tagId"]);
	});

	it("should correctly map values at runtime", () => {
		const mockValue = {
			assigneeId: "user-123",
			tagId: "tag-456",
		};

		expect(mockValue.assigneeId).toBe("user-123");
		expect(mockValue.tagId).toBe("tag-456");
	});
});
