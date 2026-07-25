const { getClientForUser } = require("../services/database.service");
const crypto = require("crypto");


function getSupabaseClient(authHeader) {
    if (!authHeader) {
        throw new Error("Authorization header is required.");
    }
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
        throw new Error("Invalid Authorization header.");
    }

    const token = parts[1];

    return getClientForUser(token);
}

async function addSubmission(data, file, authHeader) {
    const uniqueName =
`${crypto.randomUUID()}-${file.originalname}`;

const storagePath =
`${data.assignment_id}/${data.student_id}/${uniqueName}`;

    const supabase = getSupabaseClient(authHeader);
    const { error: uploadError } = await supabase.storage
        .from("assignment-submissions")
        .upload(
            storagePath,
            file.buffer,
            {
                contentType: file.mimetype,
                upsert: false
            }
        );

    if (uploadError) {
        throw new Error(uploadError.message);
    }

    const { data: submission, error } = await supabase
        .from("assignment_submissions")
        .insert({
            assignment_id: data.assignment_id,
            student_id: data.student_id,
            file_url: storagePath,
            file_name: file.originalname,
            file_type: file.mimetype,
            file_size: file.size,
            status: data.status,
            submitted_at: data.submitted_at
        })
        .select()
        .single();

    if (error) {

    await supabase.storage
        .from("assignment-submissions")
        .remove([storagePath]);

    throw new Error(error.message);
}

    return submission;
}

async function findSubmission(id, authHeader) {

    const supabase = getSupabaseClient(authHeader);

    const { data, error } = await supabase
        .from("assignment_submissions")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return null;
    }

    return data;
}

async function findSubmissionByAssignmentAndStudent(
    assignmentId,
    studentId,
    authHeader
) {

    const supabase = getSupabaseClient(authHeader);

    const { data, error } = await supabase
    .from("assignment_submissions")
    .select("*")
    .eq("assignment_id", assignmentId)
    .eq("student_id", studentId)
    .maybeSingle();

if (error) {
    throw new Error(error.message);
}

return data;
}

async function findStudentSubmissions(studentId, authHeader) {

    const supabase = getSupabaseClient(authHeader);

    const { data, error } = await supabase
    .from("assignment_submissions")
    .select("*")
    .eq("student_id", studentId);

if (error) {
    throw new Error(error.message);
}

return data;
}

async function findAssignmentSubmissions(
    assignmentId,
    authHeader
) {

    const supabase = getSupabaseClient(authHeader);
    const { data, error } = await supabase
    .from("assignment_submissions")
    .select("*")
    .eq("assignment_id", assignmentId);

if (error) {
    throw new Error(error.message);
}

return data;
}

async function updateSubmission(
    id,
    changes,
    authHeader
) {

    const supabase = getSupabaseClient(authHeader);

    const { data, error } = await supabase
    .from("assignment_submissions")
    .update(changes)
    .eq("id", id)
    .select()
    .single();

if (error) {
    throw new Error(error.message);
}

return data;
}

async function removeSubmission(id, authHeader) {

    const supabase = getSupabaseClient(authHeader);

    const { data, error } = await supabase
    .from("assignment_submissions")
    .delete()
    .eq("id", id)
    .select()
    .single();

if (error) {
    throw new Error(error.message);
}

return data;
}

async function listSubmissions(authHeader) {

    const supabase = getSupabaseClient(authHeader);

   const { data, error } = await supabase
    .from("assignment_submissions")
    .select("*");

if (error) {
    throw new Error(error.message);
}

return data;
}

async function findSubmissionStatus(
    assignmentId,
    studentId,
    authHeader
) {

    const supabase = getSupabaseClient(authHeader);

    const { data, error } = await supabase
    .from("assignment_submissions")
    .select("status, submitted_at")
    .eq("assignment_id", assignmentId)
    .eq("student_id", studentId)
    .maybeSingle();

if (error) {
    throw new Error(error.message);
}

return data;
}
async function createDownloadUrl(filePath, authHeader) {

    const supabase = getSupabaseClient(authHeader);

    const { data, error } = await supabase.storage
        .from("assignment-submissions")
        .createSignedUrl(filePath, 300);

    if (error) {
        throw new Error(error.message);
    }

    return data.signedUrl;
}
async function getAssignmentDueDate(
    assignmentId,
    authHeader
) {
    const supabase = getSupabaseClient(authHeader);

    const { data, error } = await supabase
        .from("assignments")
        .select("due_date")
        .eq("id", assignmentId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
module.exports = {
    addSubmission,
    findSubmission,
    findSubmissionByAssignmentAndStudent,
    findStudentSubmissions,
    findAssignmentSubmissions,
    updateSubmission,
    removeSubmission,
    listSubmissions,
    findSubmissionStatus,
    createDownloadUrl,
    getAssignmentDueDate
};